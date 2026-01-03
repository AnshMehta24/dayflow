// export const uploadToCloudinary = async (
//   file: File | string
// ): Promise<string> => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", uploadPreset);

//   const res = await fetch(uploadUrl, {
//     method: "POST",
//     body: formData,
//   });

//   if (!res.ok) {
//     throw new Error("Cloudinary upload failed");
//   }

//   const data = await res.json();
//   return data.secure_url;
// };
