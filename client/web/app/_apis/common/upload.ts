interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export const uploadToCloudinaryImage = async (
  files: File[]
): Promise<CloudinaryUploadResult[] | false> => {
  const results: CloudinaryUploadResult[] = [];
  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "medicare");
      formData.append("folder", "oldvibes");

      const response = await fetch(process.env.NEXT_CLOUD_API_IMAGE || "", {
        method: "POST",
        body: formData,
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to upload ${file.name}. Status: ${response.status}`
        );
      }

      const data: CloudinaryUploadResult = await response.json();
      results.push(data);
    }
    return results;
  } catch (error: any) {
    console.error("========= Error Uploading Files:", error);
    return false;
  }
};
