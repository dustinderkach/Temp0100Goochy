import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";
import { Temp009GoochyEntry } from "../components/model/model";

export class DataService {
	private authService: AuthService;
	private s3Client: S3Client | undefined;
	private awsPrimaryRegion: string = "";
	private apiEndpointAppNameUrl: string = "";
	private s3PhotoBucketName: string = "";

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
			const s3PhotoAdminBucketName = outputs.AdminPhotosBucketName;
			const apiEndpoint = outputs.ApiEndpoint;
			const awsPrimaryRegion = outputs.PrimaryRegionName;

			if (!s3PhotoAdminBucketName || !apiEndpoint || !awsPrimaryRegion) {
				throw new Error(
					"Missing necessary parameters in outputsForFE.json"
				);
			}

			console.log("Environment:", outputs.EnvironmentName);
			console.log("s3PhotoAdminBucketName:", s3PhotoAdminBucketName);
			console.log("apiEndpoint:", apiEndpoint);
			console.log("awsRegion:", awsPrimaryRegion);

			this.awsPrimaryRegion = awsPrimaryRegion;
			this.apiEndpointAppNameUrl = apiEndpoint + "temp009Goochy";
			this.s3PhotoBucketName = s3PhotoAdminBucketName;
		} catch (error) {
			console.error("Error initializing DataService:", error);
		}
	}
	public reserveTemp009Goochy(temp009GoochyId: string) {
		return "123";
	}

	public async getTemp009Goochy(): Promise<Temp009GoochyEntry[]> {
		if (!this.apiEndpointAppNameUrl) {
			throw new Error("API endpoint is not defined");
		}
		const getTemp009GoochyResult = await fetch(this.apiEndpointAppNameUrl, {
			method: "GET",
			headers: {
				Authorization: this.authService.jwtToken!,
			},
		});
		const getTemp009GoochyResultJson = await getTemp009GoochyResult.json();
		return getTemp009GoochyResultJson;
	}

	public async createTemp009Goochy(
		name: string,
		location: string,
		photo?: File
	) {
		const temp009Goochy = {} as any;
		temp009Goochy.name = name;
		temp009Goochy.location = location;
		if (photo) {
			const uploadUrl = await this.uploadPublicFile(photo);
			temp009Goochy.photoUrl = uploadUrl;
		}
		const postResult = await fetch(this.apiEndpointAppNameUrl, {
			method: "POST",
			body: JSON.stringify(temp009Goochy),
			headers: {
				Authorization: this.authService.jwtToken!,
			},
		});
		const postResultJSON = await postResult.json();
		return postResultJSON.id;
	}


		private async uploadPublicFile(file: File) {
			// NEW: Request a pre-signed URL from the backend
			const response = await fetch(`${this.apiEndpointAppNameUrl}/get-presigned-url`, {
				method: "POST",
				body: JSON.stringify({ fileName: file.name }),
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.authService.jwtToken!}`,
				},
			});
	
			if (!response.ok) {
				throw new Error(`Failed to get pre-signed URL: ${response.statusText}`);
			}
	
			const { url } = await response.json();
	
			// NEW: Upload the file using the pre-signed URL
			const uploadResponse = await fetch(url, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			});
	
			if (!uploadResponse.ok) {
				throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
			}
	
			// Return the public URL of the uploaded file
			return url.split("?")[0]; // Remove query parameters from the pre-signed URL
	}

	public isAuthorized() {
		return this.authService.isAuthorized();
	}
}
