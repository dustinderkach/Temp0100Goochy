import {
	DeleteItemCommand,
	DynamoDBClient,
	UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { hasAdminGroup } from "../shared/Utils";

export async function deleteTemp009Goochy(
	event: APIGatewayProxyEvent,
	ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
	if (!hasAdminGroup(event)) {
		return {
			statusCode: 401,
			body: JSON.stringify(`Not authorized!`),
		};
	}

	if (event.queryStringParameters && "id" in event.queryStringParameters) {
		const temp009GoochyId = event.queryStringParameters["id"];

		await ddbClient.send(
			new DeleteItemCommand({
				TableName: process.env.TABLE_NAME,
				Key: {
					id: { S: temp009GoochyId },
				},
			})
		);

		return {
			statusCode: 200,
			body: JSON.stringify(`Deleted temp009Goochy with id ${temp009GoochyId}`),
		};
	}
	return {
		statusCode: 400,
		body: JSON.stringify("Please provide right args!!"),
	};
}
