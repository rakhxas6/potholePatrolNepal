import axios from "axios";

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "pothole_upload"); // Your unsigned preset name
  // No need to append cloud_name here for REST API; it goes in URL

  const response = await axios.post(
    "https://api.cloudinary.com/v1_1/drqnona0k/image/upload",
    formData
  );

  return response.data.secure_url;
};

export default uploadToCloudinary;
