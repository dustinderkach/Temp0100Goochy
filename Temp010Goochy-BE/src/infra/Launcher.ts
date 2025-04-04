import { App } from "aws-cdk-lib";
import { Temp010GoochyApiStack } from "./stacks/Temp010GoochyApiStack";
import { Temp010GoochyDataStack } from "./stacks/Temp010GoochyDataStack";
import { Temp010GoochyLambdaStack } from "./stacks/Temp010GoochyLambdaStack";
import { Temp010GoochyAuthStack } from "./stacks/Temp010GoochyAuthStack";
import { Temp010GoochyUiDeploymentStack } from "./stacks/Temp010GoochyUiDeploymentStack";
import { Temp010GoochyMonitorStack } from "./stacks/Temp010GoochyMonitorStack";
import { Temp010GoochyS3Stack } from "./stacks/Temp010GoochyS3Stack";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

const app = new App();

// Get environment from CDK cli context, default to DEV, e.g., cdk deploy -c env=UAT or cdk deploy --context env=UAT
const envName = app.node.tryGetContext("env") || "DEV";
// Get environments from CDK context (cdk.json)
const environments = app.node.tryGetContext("environments");

if (!environments[envName]) {
	throw new Error(`Environment "${envName}" not found in environments list.`);
}

const env = environments[envName];

console.log(
	`🚀 Deploying to environment: ${envName} (Account: ${env.account}, Region: ${env.primaryRegion})`
);

// Note: A new region will need to be bootstrapped in the CDK CLI before deploying to a new region
// Bootstrapped: US East (N. Virginia) - us-east-1, EU (Frankfurt) - eu-central-1, Asia Pacific (Singapore) - ap-southeast-1
// e.g., cdk bootstrap aws://094106269614/eu-central-1
const allRegions = [env.primaryRegion, "eu-central-1"];

// Create a global S3 stack, in one region as it's CDN and global.
const s3Stack = new Temp010GoochyS3Stack(
	app,
	`${envName}-Temp010GoochyS3Stack`,
	{
		env: { account: env.account, region: env.primaryRegion },
		envName: envName,
	}
);

// Deploy Auth stack only in a single region (global authentication).
const authStack = new Temp010GoochyAuthStack(
	app,
	`${envName}-Temp010GoochyAuthStack`,
	{
		env: { account: env.account, region: env.primaryRegion },
		photosBucket: s3Stack.photosBucket,
		envName: envName,
	}
);

//  For Deploy/Destroy purposes add dependency: Auth stack depends on S3 stack
authStack.addDependency(s3Stack);

const dataStack = new Temp010GoochyDataStack(
	app,
	`${envName}-Temp010GoochyDataStack`,
	{
		env: { account: env.account, region: env.primaryRegion },
		allRegions: allRegions,
		envName: envName,
	}
);

//  For Deploy/Destroy purposes add dependency: Data stack depends on Auth stack
dataStack.addDependency(authStack);

allRegions.forEach((region) => {
	const replicaTable = dataStack.getReplicaTable(region);

	if (replicaTable) {
		let regionName = region;
		if (region === env.primaryRegion) {
			regionName = "PrimaryRegion";
		}



		let lambdaStack = new Temp010GoochyLambdaStack(
			app,
			`${envName}-Temp010GoochyLambdaStack-${regionName}`,
			{
				env: { account: env.account, region }, // Add this line
				tableArn: replicaTable.tableArn,
				crossRegionReferences: true,
				tableName: replicaTable.tableName,
				envName: envName,
				bucketName: s3Stack.photosBucket.bucketName,
				bucketArn: s3Stack.photosBucket.bucketArn,
			}
		);

		// For Deploy/Destroy purposes add dependency: Lambda stack depends on Data stack
		lambdaStack.addDependency(dataStack);

		let apiStack = new Temp010GoochyApiStack(
			app,
			`${envName}-Temp010GoochyApiStack${regionName}`,
			{
				env: { account: env.account, region },
				crossRegionReferences: true,
				temp010GoochyLambdaIntegration:
					lambdaStack.temp010GoochyLambdaIntegration,
				userPool: authStack.userPool, // Use global user pool
				envName: envName,
			}
		);

		// For Deploy/Destroy purposes add dependency: Lambda stack depends on Data stack
		apiStack.addDependency(lambdaStack);
	}
});

// (Optional) Deploy the UI & monitor stacks in one region
const uiDeploymentStack = new Temp010GoochyUiDeploymentStack(
	app,
	`${envName}-Temp010GoochyUiDeploymentStack`,
	{
		env: { account: env.account, region: env.primaryRegion },
		envName: envName,
	}
);

//  For Deploy/Destroy purposes add dependency: UI Deployment stack depends on Auth stack
uiDeploymentStack.addDependency(authStack);

const monitorStack = new Temp010GoochyMonitorStack(
	app,
	`${envName}-Temp010GoochyMonitorStack`,
	{
		env: { account: env.account, region: env.primaryRegion },
	}
);

//  For Deploy/Destroy purposes add dependency: dMonitor stack depends on Data stack
monitorStack.addDependency(dataStack);
