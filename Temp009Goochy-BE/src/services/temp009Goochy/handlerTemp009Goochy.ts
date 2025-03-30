import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import { postTemp009Goochy as postTemp009Goochy } from "./PostTemp009Goochy";
import { getTemp009Goochy } from "./GetTemp009Goochy";
import { updateTemp009Goochy } from "./UpdateTemp009Goochy";
import { deleteTemp009Goochy } from "./DeleteTemp009Goochy";
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/Utils";
import { captureAWSv3Client, getSegment } from "aws-xray-sdk-core";

//const ddbClient = captureAWSv3Client(new DynamoDBClient({}));
const ddbClient = captureAWSv3Client
	? captureAWSv3Client(new DynamoDBClient({}))
	: new DynamoDBClient({});

async function handlerTemp009Goochy(
	event: APIGatewayProxyEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	let response: APIGatewayProxyResult;

	try {
		switch (event.httpMethod) {
			case "GET":
				const subSegGET =
					getSegment().addNewSubsegment("GET-Temp009Goochy");
				const getResponse = await getTemp009Goochy(event, ddbClient);
				subSegGET.close();
				response = getResponse;
				break;
			case "POST":
				const subSegPOST =
					getSegment().addNewSubsegment("POST-Temp009Goochy");
				const postResponse = await postTemp009Goochy(event, ddbClient);
				subSegPOST.close();
				response = postResponse;
				break;
			case "PUT":
				const subSegPUT =
					getSegment().addNewSubsegment("PUT-Temp009Goochy");
				const putResponse = await updateTemp009Goochy(event, ddbClient);
				subSegPUT.close();
				response = putResponse;
				break;
			case "DELETE":
				const subSegDELETE =
					getSegment().addNewSubsegment("DELETE-Temp009Goochy");
				const deleteResponse = await deleteTemp009Goochy(event, ddbClient);
				subSegDELETE.close();
				response = deleteResponse;
				break;
			default:
				break;
		}
	} catch (error) {
		if (error instanceof MissingFieldError) {
			return {
				statusCode: 400,
				body: error.message,
			};
		}
		if (error instanceof JsonError) {
			return {
				statusCode: 400,
				body: error.message,
			};
		}
		return {
			statusCode: 500,
			body: error.message,
		};
	}
	addCorsHeader(response);
	return response;
}

export { handlerTemp009Goochy};
