import { Duration, Fn, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime, Tracing } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface Temp010GoochyLambdaStackProps extends StackProps {
	tableArn: string;
	tableName: string;
	envName: string;
	bucketName: string;
	bucketArn: string;
}

export class Temp010GoochyLambdaStack extends Stack {
	public readonly temp010GoochyLambdaIntegration: LambdaIntegration;

	constructor(
		scope: Construct,
		id: string,
		props: Temp010GoochyLambdaStackProps
	) {
		super(scope, id, props);

		// Create the SSM parameter in the same region as the Lambda stack
		const bucketArnParameter = new StringParameter(
			this,
			`/${props.envName}/Temp010GoochyAdminPhotosBucketArn`,
			{
				parameterName: `/${props.envName}/Temp010GoochyAdminPhotosBucketArn`,
				stringValue: props.bucketArn, // Use the ARN passed from the S3 stack
			}
		);

		const temp010GoochyLambda = new NodejsFunction(
			this,
			`${props.envName}-Temp010GoochyLambda`,
			{
				runtime: Runtime.NODEJS_18_X,
				handler: "handlerTemp010Goochy",
				entry: join(
					__dirname,
					"..",
					"..",
					"services",
					"Temp010Goochy",
					"handlerTemp010Goochy.ts"
				),
				environment: {
					TABLE_NAME: props.tableName,
					BUCKET_ARN: props.bucketArn,
				},
				tracing: Tracing.ACTIVE,
				timeout: Duration.minutes(1),
			}
		);

		temp010GoochyLambda.addToRolePolicy(
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

		temp010GoochyLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ["ssm:GetParameter"],
				resources: [
					`arn:aws:ssm:${props.env?.region}:${props.env?.account}:parameter/${props.envName}/Temp010GoochyAdminPhotosBucketArn`,
				],
			})
		);
		console.log("Retrieved Bucket ARN:", `${props.bucketArn}/*`);
		// Add permissions for S3 (NEW)
		temp010GoochyLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ["s3:PutObject", "s3:GetObject"],
				resources: [`${props.bucketArn}/*`],
			})
		);

		// Add permissions for Secrets Manager (NEW)
		const secret = Secret.fromSecretNameV2(
			this,
			`${props.envName}-Temp010GoochySecret`,
			`${props.envName}-Temp010GoochySecret`
		);

		// Grant the Lambda access to read the secret
		temp010GoochyLambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ["secretsmanager:GetSecretValue"],
				resources: [secret.secretArn],
			})
		);

		temp010GoochyLambda.addEnvironment(
			"PARAMETER_NAME",
			`/${props.envName}/Temp010GoochyAdminPhotosBucketArn`
		);

		// Pass the secret ARN as an environment variable to the Lambda function (NEW)
		temp010GoochyLambda.addEnvironment("SECRET_ARN", secret.secretArn);

		this.temp010GoochyLambdaIntegration = new LambdaIntegration(
			temp010GoochyLambda
		);
	}
}
