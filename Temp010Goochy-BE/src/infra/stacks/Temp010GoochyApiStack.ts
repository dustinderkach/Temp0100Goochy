import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import {
	AuthorizationType,
	CognitoUserPoolsAuthorizer,
	Cors,
	LambdaIntegration,
	MethodOptions,
	ResourceOptions,
	RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

interface Temp010GoochyApiStackProps extends StackProps {
	temp010GoochyLambdaIntegration: LambdaIntegration;
	userPool: IUserPool;
	env: { account: string; region: string };
	envName: string;
}

export class Temp010GoochyApiStack extends Stack {
	constructor(
		scope: Construct,
		id: string,
		props: Temp010GoochyApiStackProps
	) {
		super(scope, id, props);

		const api = new RestApi(this, `${props.envName}-Temp010GoochyApi`, {
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
				allowMethods: Cors.ALL_METHODS,
			},
		});

		const authorizer = new CognitoUserPoolsAuthorizer(
			this,
			`${props.envName}-Temp010GoochyApiAuthorizer`,
			{
				cognitoUserPools: [props.userPool],
				identitySource: "method.request.header.Authorization",
			}
		);

		const optionsWithAuth: MethodOptions = {
			authorizationType: AuthorizationType.COGNITO,
			authorizer: authorizer, // updated, _attachToApi no longer required
		};

		const temp010GoochyResource = api.root.addResource(
			`${props.envName}-temp010Goochy`
		);
		temp010GoochyResource.addMethod(
			"GET",
			props.temp010GoochyLambdaIntegration,
			optionsWithAuth
		);
		temp010GoochyResource.addMethod(
			"POST",
			props.temp010GoochyLambdaIntegration,
			optionsWithAuth
		);
		temp010GoochyResource.addMethod(
			"PUT",
			props.temp010GoochyLambdaIntegration,
			optionsWithAuth
		);
		temp010GoochyResource.addMethod(
			"DELETE",
			props.temp010GoochyLambdaIntegration,
			optionsWithAuth
		);

		const apiEndpoint = `${api.url}${props.envName}-temp010Goochy`;
		new CfnOutput(this, `${props.envName}-Temp010GoochyApiEndpoint`, {
			value: apiEndpoint,
			description: "The endpoint of the Temp010Goochy API",
			exportName: `${props.envName}-Temp010GoochyApiEndpoint`,
		});
	}
}
