import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";
import { Temp010GoochyEntry } from "../components/model/model";

export class DataService {
	private authService: AuthService;
	private s3Client: S3Client | undefined;
	private awsPrimaryRegion: string = "";
	private apiEndpointAppNameUrl: string = "";

	constructor(authService: AuthService) {
		this.authService = authService;
		this.initializeDataService().catch((error) => {
			console.error("Failed to initialize DataService:", error);
		});
	}

	private async initializeDataService() {
		try {
			// Fetch the outputsForFE.json file
			const response = await fetch("/outputsForFE.json");
			if (!response.ok) {
				throw new Error(
					`Failed to fetch outputsForFE.json: ${response.statusText}`
				);
			}

			const outputs = await response.json();

			// Extract the required values from the JSON file
			const apiEndpoint = outputs["ApiEndpoint-PrimaryRegion"];
			const awsPrimaryRegion = outputs.PrimaryRegionName;

			if (!apiEndpoint || !awsPrimaryRegion) {
				throw new Error(
					"Missing necessary parameters in outputsForFE.json"
				);
			}

			console.log("Environment:", outputs.EnvironmentName);
			console.log("apiEndpoint:", apiEndpoint);
			console.log("awsRegion:", awsPrimaryRegion);

			this.awsPrimaryRegion = awsPrimaryRegion;
			this.apiEndpointAppNameUrl = apiEndpoint;
		} catch (error) {
			console.error("Error initializing DataService:", error);
		}
	}
	public reserveTemp010Goochy(temp010GoochyId: string) {
		return "123";
	}

	public async getTemp010Goochy(): Promise<Temp010GoochyEntry[]> {
		if (!this.apiEndpointAppNameUrl) {
			throw new Error("API endpoint is not defined");
		}
		const getTemp010GoochyResult = await fetch(this.apiEndpointAppNameUrl, {
			method: "GET",
			headers: {
				Authorization: this.authService.jwtToken!,
			},
		});
		const getTemp010GoochyResultJson = await getTemp010GoochyResult.json();
		return getTemp010GoochyResultJson;
	}

	public async createTemp010Goochy(
		name: string,
		location: string,
		photo?: File
	) {
		const temp010Goochy = {} as any;
		temp010Goochy.name = name;
		temp010Goochy.location = location;
		if (photo) {
			const uploadUrl = await this.uploadPublicFile(photo);
			temp010Goochy.photoUrl = uploadUrl;
		}
		const postResult = await fetch(this.apiEndpointAppNameUrl, {
			method: "POST",
			body: JSON.stringify(temp010Goochy),
			headers: {
				Authorization: this.authService.jwtToken!,
			},
		});
		const postResultJSON = await postResult.json();
		return postResultJSON.id;
	}

	private async uploadPublicFile(file: File) {
		// NEW: Request a pre-signed URL from the backend
		const response = await fetch(
			`${this.apiEndpointAppNameUrl}/get-presigned-url`,
			{
				method: "POST",
				body: JSON.stringify({ fileName: file.name }),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.authService.jwtToken!}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(
				`Failed to get pre-signed URL: ${response.statusText}`
			);
		}

		const { url } = await response.json();

		// NEW: Upload the file using the pre-signed URL
		const uploadResponse = await fetch(url, {
			method: "PUT",
			body: file,
			headers: { "Content-Type": file.type },
		});

		if (!uploadResponse.ok) {
			throw new Error(
				`Failed to upload file: ${uploadResponse.statusText}`
			);
		}

		// Return the public URL of the uploaded file
		return url.split("?")[0]; // Remove query parameters from the pre-signed URL
	}

	public isAuthorized() {
		return this.authService.isAuthorized();
	}
}
