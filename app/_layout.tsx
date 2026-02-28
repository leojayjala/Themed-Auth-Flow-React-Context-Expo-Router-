import React, { createContext, useContext, useMemo, useState } from "react";
import { Stack } from "expo-router";

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
  setCredentials: (value: Credentials | null) => void;
  setProfile: (value: Profile) => void;
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

  const value = useMemo(
    () => ({
      credentials,
      profile,
      setCredentials,
      setProfile,
    }),
    [credentials, profile]
  );

  return (
    <AuthFlowContext.Provider value={value}>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthFlowContext.Provider>
  );
}
