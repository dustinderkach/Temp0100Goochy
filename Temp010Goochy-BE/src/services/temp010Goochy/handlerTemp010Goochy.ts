import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import { postTemp010Goochy as postTemp010Goochy } from "./PostTemp010Goochy";
import { getTemp010Goochy } from "./GetTemp010Goochy";
import { updateTemp010Goochy } from "./UpdateTemp010Goochy";
import { deleteTemp010Goochy } from "./DeleteTemp010Goochy";
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/Utils";
import { captureAWSv3Client, getSegment } from "aws-xray-sdk-core";

//const ddbClient = captureAWSv3Client(new DynamoDBClient({}));
const ddbClient = captureAWSv3Client
	? captureAWSv3Client(new DynamoDBClient({}))
	: new DynamoDBClient({});

async function handlerTemp010Goochy(
	event: APIGatewayProxyEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	let response: APIGatewayProxyResult;

	try {
		switch (event.httpMethod) {
			case "GET":
				const subSegGET =
					getSegment().addNewSubsegment("GET-Temp010Goochy");
				const getResponse = await getTemp010Goochy(event, ddbClient);
				subSegGET.close();
				response = getResponse;
				break;
			case "POST":
				const subSegPOST =
					getSegment().addNewSubsegment("POST-Temp010Goochy");
				const postResponse = await postTemp010Goochy(event, ddbClient);
				subSegPOST.close();
				response = postResponse;
				break;
			case "PUT":
				const subSegPUT =
					getSegment().addNewSubsegment("PUT-Temp010Goochy");
				const putResponse = await updateTemp010Goochy(event, ddbClient);
				subSegPUT.close();
				response = putResponse;
				break;
			case "DELETE":
				const subSegDELETE =
					getSegment().addNewSubsegment("DELETE-Temp010Goochy");
				const deleteResponse = await deleteTemp010Goochy(event, ddbClient);
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

export { handlerTemp010Goochy};
