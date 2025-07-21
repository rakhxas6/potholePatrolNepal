import axios from "axios";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "pothole_upload"); // Use your actual unsigned preset

  // Detect file type and choose correct endpoint
  const isVideo = file.type.startsWith("video/");
  const resourceType = isVideo ? "video" : "image";

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/drqnona0k/${resourceType}/upload`,
    formData
  );

  return response.data.secure_url;
};

export default uploadToCloudinary;
