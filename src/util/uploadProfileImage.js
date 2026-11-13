import axiosConfig from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const MAX_PHOTO_BYTES = 1024 * 1024;
export const PHOTO_TYPES = "image/jpeg,image/png,image/webp";

// Uploads the profile photo to the backend, which checks it and stores it (no third-party upload from the browser).
// Returns the updated profile, whose profileImageUrl points to the new photo.
const uploadProfileImage = async (image) => {
  const formData = new FormData();
  formData.append("file", image);
  const response = await axiosConfig.put(API_ENDPOINTS.PROFILE_PHOTO, formData);
  return response.data;
};

export default uploadProfileImage;
