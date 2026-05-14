"use client";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext({} as any);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpNewUser = async ({
    email,
    name,
    password,
  }: {
    email: string;
    name: string;
    password: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          emailRedirectTo: `${window.location.origin}/`,
        },
      },
    });
    if (error) {
      console.error("Error signing up:", error.message);
      return { success: false, error: error.message };
    }
    console.log("Sign-up response:", data);
    return { success: true };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      return { success: false, error: error.message };
    } else {
      setSession(null);
      return { success: true };
    }
  };

  const signInUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error signing in:", error.message);
      return { success: false, error: error.message };
    }
    console.log("Sign-in response:", data);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{ session, signOut, signInUser, signUpNewUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const userAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("userAuth must be used within an AuthContextProvider");
  }
  return context;
};
