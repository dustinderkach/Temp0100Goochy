import * as fs from "fs";
import * as path from "path";

// Define the structure of the outputs.json file
interface StackOutputs {
	[key: string]: string;
}

interface OutputsFile {
	[stackName: string]: StackOutputs;
}

// Define the structure of the filtered outputs
interface FilteredOutputs {
	[key: string]: string;
}

// Paths
const outputFilePath = "outputs.json";
const frontendPublicPath = path.resolve(
	__dirname,
	"../Temp009Goochy-FE/public/outputsForFE.json"
);

try {
	const outputFileContent = fs.readFileSync(outputFilePath, "utf8");
	const outputFileParsed: OutputsFile = JSON.parse(outputFileContent);
	const filteredOutputs: FilteredOutputs = {};

	// Iterate over each stack output
	for (const stack in outputFileParsed) {
		if (outputFileParsed.hasOwnProperty(stack)) {
			// Iterate over each key in the stack output
			for (const key in outputFileParsed[stack]) {
				if (outputFileParsed[stack].hasOwnProperty(key)) {
					const keyName = outputFileParsed[stack][key];

					if (
						keyName &&
						typeof keyName === "string" &&
						keyName.trim() !== ""
					) {
						switch (true) {
							case key.includes("AdminPhotosBucketName"):
								filteredOutputs["AdminPhotosBucketName"] =
									keyName;
								break;
							case key.includes("EnvironmentName"):
								filteredOutputs["EnvironmentName"] = keyName;
								break;
							case key.includes("UserPoolId"):
								filteredOutputs["UserPoolId"] = keyName;
								break;
							case key.includes("UserPoolClientId"):
								filteredOutputs["UserPoolClientId"] = keyName;
								break;
							case key.includes("PrimaryRegionName"):
								filteredOutputs["PrimaryRegionName"] = keyName;
								break;
							case key.includes("IdentityPoolId"):
								filteredOutputs["IdentityPoolId"] = keyName;
								break;
							case key.includes("ApiEndpoint"):
								filteredOutputs["ApiEndpoint"] = keyName;
								break;
							default:
								// Do not include this
								break;
						}
					}
				}
			}
		}
	}

	// Concatenate EnvironmentName to ApiEndpoint if both exist
	if (filteredOutputs["ApiEndpoint"] && filteredOutputs["EnvironmentName"]) {
		filteredOutputs[
			"ApiEndpoint"
		] += `/${filteredOutputs["EnvironmentName"]}-`;
	}

	// Write the filtered outputs to the frontend's public directory
	fs.writeFileSync(
		frontendPublicPath,
		JSON.stringify(filteredOutputs, null, 2),
		"utf8"
	);

	// Delete the original outputs.json file
	fs.unlinkSync(outputFilePath);

	console.log(
		`Filtered outputs written to ${frontendPublicPath} and outputs.json deleted`
	);
} catch (error) {
	console.error("Error processing outputs.json:", error);
}
