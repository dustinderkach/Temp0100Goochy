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

interface Temp009GoochyApiStackProps extends StackProps {
	temp009GoochyLambdaIntegration: LambdaIntegration;
	userPool: IUserPool;
	env: { account: string; region: string };
	envName: string;
}

export class Temp009GoochyApiStack extends Stack {
	constructor(
		scope: Construct,
		id: string,
		props: Temp009GoochyApiStackProps
	) {
		super(scope, id, props);

		const api = new RestApi(this, `${props.envName}-Temp009GoochyApi`, {
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
				allowMethods: Cors.ALL_METHODS,
			},
		});

		const authorizer = new CognitoUserPoolsAuthorizer(
			this,
			`${props.envName}-Temp009GoochyApiAuthorizer`,
			{
				cognitoUserPools: [props.userPool],
				identitySource: "method.request.header.Authorization",
			}
		);

		const optionsWithAuth: MethodOptions = {
			authorizationType: AuthorizationType.COGNITO,
			authorizer: authorizer, // updated, _attachToApi no longer required
		};

		const temp009GoochyResource = api.root.addResource(
			`${props.envName}-temp009Goochy`
		);
		temp009GoochyResource.addMethod(
			"GET",
			props.temp009GoochyLambdaIntegration,
			optionsWithAuth
		);
		temp009GoochyResource.addMethod(
			"POST",
			props.temp009GoochyLambdaIntegration,
			optionsWithAuth
		);
		temp009GoochyResource.addMethod(
			"PUT",
			props.temp009GoochyLambdaIntegration,
			optionsWithAuth
		);
		temp009GoochyResource.addMethod(
			"DELETE",
			props.temp009GoochyLambdaIntegration,
			optionsWithAuth
		);

		const apiEndpoint = `${api.url}${props.envName}-`;
		new CfnOutput(this, `${props.envName}-Temp009GoochyApiEndpoint-`, {
			value: apiEndpoint,
			description: "The endpoint of the Temp009Goochy API",
			exportName: `${props.envName}-Temp009GoochyApiEndpoint`,
		});


	}

}
