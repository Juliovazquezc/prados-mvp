import { supabase } from "./supabase";

/**
 * Upload an image to Supabase storage
 * @param file - The file or blob to upload
 * @param userId - The user ID to use as a folder path
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (
  file: File | Blob,
  userId: string
): Promise<string> => {
  // Generate a unique filename
  const fileExt = file instanceof File ? file.name.split(".").pop() : "jpg";
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // Get the public URL
  const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Delete an image from Supabase storage
 * @param imageUrl - The public URL of the image to delete
 * @param userId - The user ID that owns the image
 */
export const deleteImage = async (imageUrl: string, userId: string) => {
  const path = imageUrl.split("/").pop();
  if (!path) return;

  const { error } = await supabase.storage
    .from("post-images")
    .remove([`${userId}/${path}`]);

  if (error) {
    console.error("Error deleting image:", error);
    throw error;
  }

  return { success: true };
};

/**
 * Upload an image from a data URL (like from canvas or file reader)
 * @param dataUrl - The data URL string
 * @param userId - The user ID to use as a folder path
 * @returns The public URL of the uploaded image
 */
export const uploadImageFromDataUrl = async (
  dataUrl: string,
  userId: string
): Promise<string> => {
  try {
    // Convert data URL to blob
    const blob = await fetch(dataUrl).then((res) => res.blob());

    // Generate a unique filename
    const fileName = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Upload the blob
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, blob, {
        contentType: blob.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Delete multiple images from Supabase storage
 * @param imageUrls - Array of public URLs to delete
 * @param userId - The user ID that owns the images
 */
export const deleteMultipleImages = async (
  imageUrls: string[],
  userId: string
) => {
  const paths = imageUrls
    .map((url) => url.split("/").pop())
    .filter(Boolean)
    .map((path) => `${userId}/${path}`);

  if (paths.length === 0) return { success: true };

  const { error } = await supabase.storage.from("post-images").remove(paths);

  if (error) {
    console.error("Error deleting images:", error);
    throw error;
  }

  return { success: true };
};
