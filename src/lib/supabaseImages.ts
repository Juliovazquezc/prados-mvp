import { supabase } from "./supabase";

export const uploadImage = async (
  file: File,
  userId: string
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, file);
  if (uploadError) {
    throw uploadError;
  }
  const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
  return data.publicUrl;
};

export const deleteImage = async (imageUrl: string, userId: string) => {
  const path = imageUrl.split("/").pop();
  if (!path) return;
  const { error } = await supabase.storage
    .from("post-images")
    .remove([`${userId}/${path}`]);
  if (error) {
    console.error("Error deleting image:", error);
  }
};
