export const uploadToCloudinary = async (
  file: File | string
): Promise<string> => {
  const uploadPreset = process.env.UPLOAD_PRESET!;
  const cloudName = process.env.CLOUD_NAME!;

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  console.log(uploadPreset, cloudName, "data");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });
  console.log(res);

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};
