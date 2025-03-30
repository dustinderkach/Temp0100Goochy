import { Duration, Fn, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";


interface Temp009GoochyLambdaStackProps extends StackProps {
	tableArn: string;
	tableName: string;
	envName: string;
	bucketName: string;
	bucketArn: string;
}

export class Temp009GoochyLambdaStack extends Stack {
	public readonly temp009GoochyLambdaIntegration: LambdaIntegration;

	constructor(
		scope: Construct,
		id: string,
		props: Temp009GoochyLambdaStackProps
	) {
		super(scope, id, props);

	       // Create the SSM parameter in the same region as the Lambda stack
	   const bucketArnParameter = new StringParameter(this, `/${props.envName}/Temp009GoochyAdminPhotosBucketArn`, {
		parameterName: `/${props.envName}/Temp009GoochyAdminPhotosBucketArn`,
		stringValue: props.bucketArn, // Use the ARN passed from the S3 stack
	});

		const temp009GoochyLambda = new NodejsFunction(
			this,
			`${props.envName}-Temp009GoochyLambda`,
			{
				runtime: Runtime.NODEJS_18_X,
				handler: "handlerTemp009Goochy",
				entry: join(
					__dirname,
					"..",
					"..",
					"services",
					"Temp009Goochy",
					"handlerTemp009Goochy.ts"
				),
				environment: {
					TABLE_NAME: props.tableName,
					BUCKET_ARN: props.bucketArn,
				},
				tracing: Tracing.ACTIVE,
				timeout: Duration.minutes(1),
			}
		);

		temp009GoochyLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [props.tableArn],
				actions: [
					"dynamodb:PutItem",
					"dynamodb:Scan",
					"dynamodb:GetItem",
					"dynamodb:UpdateItem",
					"dynamodb:DeleteItem",
				],
			})
		);

		temp009GoochyLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ["ssm:GetParameter"],
				resources: [
					`arn:aws:ssm:${props.env?.region}:${props.env?.account}:parameter/${props.envName}/AdminPhotosBucketArn`,
				],
			})
		);
		console.log("Retrieved Bucket ARN:", `${props.bucketArn}/*`);
		// Add permissions for S3 (NEW)
		temp009GoochyLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ["s3:PutObject", "s3:GetObject"],
				resources: [`${props.bucketArn}/*`],
			})
		);

		// Add permissions for Secrets Manager (NEW)
		const secret = Secret.fromSecretNameV2(
			this,
			`${props.envName}-Temp009GoochySecret`,
			`${props.envName}-Temp009GoochySecret`
		);

		// Grant the Lambda access to read the secret
		temp009GoochyLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ["secretsmanager:GetSecretValue"],
				resources: [secret.secretArn],
			})
		);

		// Pass the secret ARN as an environment variable to the Lambda function (NEW)
		temp009GoochyLambda.addEnvironment("SECRET_ARN", secret.secretArn);

		this.temp009GoochyLambdaIntegration = new LambdaIntegration(
			temp009GoochyLambda
		);
	}
}
