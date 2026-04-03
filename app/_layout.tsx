import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "./_theme";
import { storage } from "./_storage";

export type Credentials = {
  email: string;
  password: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  profilePhotoUri: string;
};

type AuthFlowContextType = {
  credentials: Credentials | null;
  profile: Profile;
  isLoggedIn: boolean;
  rememberMe: boolean;
  isHydrated: boolean;
  setCredentials: (value: Credentials | null) => void;
  setProfile: (value: Profile) => void;
  setIsLoggedIn: (value: boolean) => void;
  setRememberMe: (value: boolean) => void;
};

const AuthFlowContext = createContext<AuthFlowContextType | null>(null);

export function useAuthFlow() {
  const context = useContext(AuthFlowContext);
  if (!context) {
    throw new Error("useAuthFlow must be used inside AuthFlowProvider.");
  }
  return context;
}

export default function RootLayout() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    profilePhotoUri: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedRememberMe = storage.getItem("rememberMe") === "true";
    setRememberMe(storedRememberMe);

    const storedCredentials = storage.getItem("credentials");
    if (storedCredentials) {
      try {
        const parsed = JSON.parse(storedCredentials) as Credentials;
        if (parsed?.email && parsed?.password) setCredentials(parsed);
      } catch {
        // ignore
      }
    }

    const storedProfile = storage.getItem("profile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as Profile;
        if (typeof parsed?.firstName === "string" && typeof parsed?.lastName === "string") setProfile(parsed);
      } catch {
        // ignore
      }
    }

    const storedLoggedIn = storage.getItem("sessionLoggedIn") === "true";
    setIsLoggedIn(storedRememberMe && storedLoggedIn);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    storage.setItem("rememberMe", rememberMe ? "true" : "false");
    if (!rememberMe) storage.removeItem("sessionLoggedIn");
  }, [rememberMe]);

  useEffect(() => {
    if (credentials) storage.setItem("credentials", JSON.stringify(credentials));
    else storage.removeItem("credentials");
  }, [credentials]);

  useEffect(() => {
    storage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (rememberMe) storage.setItem("sessionLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn, rememberMe]);

  const value = useMemo(
    () => ({
      credentials,
      profile,
      isLoggedIn,
      rememberMe,
      isHydrated,
      setCredentials,
      setProfile,
      setIsLoggedIn,
      setRememberMe,
    }),
    [credentials, profile, isLoggedIn, rememberMe, isHydrated]
  );

  return (
    <ThemeProvider>
      <AuthFlowContext.Provider value={value}>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthFlowContext.Provider>
    </ThemeProvider>
  );
}
