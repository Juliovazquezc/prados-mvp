// filepath: /Users/juliovazquez/Development/prados-mvp/src/lib/authApi.ts
import { supabase } from "./supabase";

export type UserMetadata = {
  full_name: string;
  email?: string;
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
  // Validate password length
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

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
  // Validate password length
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

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
    email: email,
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
 * Sign in with OTP via SMS
 * @param phone_number Formato: +52xxxxxxxxxx (con código de país)
 */
export const signInWithPhone = async (phone_number: string) => {
  const formattedPhone = formatPhoneWithCountryCode(phone_number);
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) throw error;
  return { success: true, data };
};

/**
 * Verify the OTP sent to the phone number
 */
export const verifyOtp = async (phone_number: string, otp: string) => {
  const formattedPhone = formatPhoneWithCountryCode(phone_number);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otp,
    type: "sms",
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in with phone number and password
 */
export const signInWithPhonePassword = async (
  phone_number: string,
  password: string
) => {
  // Validate password length
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  const formattedPhone = formatPhoneWithCountryCode(phone_number);

  const { data, error } = await supabase.auth.signInWithPassword({
    phone: formattedPhone,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Set password after phone verification
 * @param password La nueva contraseña para el usuario
 */
export const setPasswordAfterPhoneVerification = async (
  password: string,
  email: string
) => {
  const { data, error } = await supabase.auth.updateUser({
    password: password,
    email,
  });

  if (error) throw error;
  return data;
};

/**
 * Format phone number with country code
 */
export const formatPhoneWithCountryCode = (phone: string) => {
  // Remove any non-numeric characters
  const numericOnly = phone.replace(/\D/g, "");

  // Add Mexico country code (+52) if not present
  if (numericOnly.length === 10) {
    return `+52${numericOnly}`;
  }

  // If already has country code or other format, return as is with + prefix
  return numericOnly.startsWith("52") ? `+${numericOnly}` : `+${numericOnly}`;
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
