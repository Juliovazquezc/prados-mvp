import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
// Importación relativa para mayor claridad
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signOut as authSignOut,
  signInWithPhone,
  verifyOtp,
  signInWithPhonePassword,
  setPasswordAfterPhoneVerification,
} from "../lib/authApi";

type UserMetadata = {
  full_name: string;
  street: string;
  house_number: string;
  phone_number: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata: UserMetadata
  ) => Promise<void>;
  signInWithPhone: (phone_number: string) => Promise<void>;
  verifyPhoneOtp: (
    phone: string,
    otp: string
  ) => Promise<
    | { user: User | null; session: Session | null }
    | { user: null; session: null }
  >;
  signInWithPhonePassword: (phone: string, password: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailPassword(email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: UserMetadata
  ) => {
    await signUpWithEmailPassword(email, password, metadata);
  };

  const signInPhone = async (phone_number: string) => {
    await signInWithPhone(phone_number);
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    return await verifyOtp(phone, otp);
  };

  const signInWithPhoneAndPassword = async (
    phone: string,
    password: string
  ) => {
    await signInWithPhonePassword(phone, password);
  };

  const setPassword = async (password: string) => {
    await setPasswordAfterPhoneVerification(password);
  };

  const signOut = async () => {
    await authSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithPhone: signInPhone,
        verifyPhoneOtp,
        signInWithPhonePassword: signInWithPhoneAndPassword,
        setPassword,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
