// filepath: /Users/juliovazquez/Development/prados-mvp/src/lib/authApi.ts
import { supabase } from "./supabase";

export type UserMetadata = {
  full_name: string;
  street: string;
  house_number: string;
  phone_number: string;
};

/**
 * Sign in with email and password
 */
export const signInWithEmailPassword = async (
  email: string,
  password: string
) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Sign up with email, password and profile data
 */
export const signUpWithEmailPassword = async (
  email: string,
  password: string,
  metadata: UserMetadata
) => {
  // Sign up the user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw signUpError;
  if (!authData.user) throw new Error("No user data returned from signup");

  // Create the user profile directly
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    full_name: metadata.full_name,
    phone_number: metadata.phone_number,
    street: metadata.street,
    house_number: metadata.house_number,
  });

  if (profileError) {
    console.error("Error creating profile:", profileError);
    throw profileError;
  }

  // Automatically sign in after signup
  return await signInWithEmailPassword(email, password);
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

/**
 * Get the current session
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

/**
 * Get the current user
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};
