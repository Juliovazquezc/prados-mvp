import { supabase } from "./supabase";
import { Post } from "@/types/database.types";

// ======== Listings (Posts) API Functions ========

/**
 * Create a new listing/post
 */
export const createListing = async (postData: {
  title: string;
  description: string;
  price: number;
  category: string[];
  images: string[];
  user_id: string;
  show_in_homepage: boolean;
}) => {
  const { data, error } = await supabase
    .from("posts")
    .insert(postData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update an existing listing/post
 */
export const updateListing = async (
  id: string,
  userId: string,
  updateData: Partial<{
    title: string;
    description: string;
    price: number;
    category: string[];
    images: string[];
    show_in_homepage: boolean;
    updated_at: string;
  }>
) => {
  const { error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
  return { success: true };
};

/**
 * Delete a listing/post
 */
export const deleteListing = async (id: string) => {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
};

/**
 * Get a listing by ID
 */
export const getListingById = async (id: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all listings
 */
export const getAllListings = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get listings by user ID
 */
export const getListingsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Toggle listing visibility in homepage
 */
export const toggleListingVisibility = async (
  postId: string,
  userId: string,
  currentValue: boolean
) => {
  const { error } = await supabase
    .from("posts")
    .update({ show_in_homepage: !currentValue })
    .eq("id", postId)
    .eq("user_id", userId);

  if (error) throw error;
  return { success: true };
};

/**
 * Count user listings
 */
export const countUserListings = async (userId: string) => {
  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count || 0;
};

// ======== User Profile API Functions ========

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone_number, street, house_number")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  profileData: {
    full_name?: string;
    phone_number?: string;
    street?: string;
    house_number?: string;
  }
) => {
  const { error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId);

  if (error) throw error;
  return { success: true };
};

/**
 * Create user profile (typically used during signup)
 */
export const createUserProfile = async (
  userId: string,
  profileData: {
    full_name: string;
    phone_number: string;
    street: string;
    house_number: string;
  }
) => {
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    ...profileData,
  });

  if (error) throw error;
  return { success: true };
};

// ======== Categories API Functions ========

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  if (error) throw error;
  return data?.map((cat) => cat.name) || [];
};
