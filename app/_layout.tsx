import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  setPersistence,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  type User,
} from "firebase/auth";
import { ThemeProvider } from "./_theme";
import { storage } from "./_storage";
import { getFirebaseAuth, isFirebaseConfigured } from "./_firebase";

export type Profile = {
  firstName: string;
  lastName: string;
  profilePhotoUri: string;
};

type AuthFlowContextType = {
  user: User | null;
  profile: Profile;
  isLoggedIn: boolean;
  rememberMe: boolean;
  isHydrated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  completeGoogleSignIn: (params: { idToken: string; accessToken?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setProfile: (value: Profile) => void;
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
  const auth = useMemo(() => (isFirebaseConfigured ? getFirebaseAuth() : null), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    profilePhotoUri: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!auth) {
      setIsHydrated(true);
      return;
    }

    const hydrateRememberMe = async () => {
      const storedRememberMe = (await storage.getItem("rememberMe")) === "true";
      if (!isCancelled) setRememberMe(storedRememberMe);
    };

    hydrateRememberMe();

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      const sessionOnly = (await storage.getItem("sessionOnly")) === "true";
      if (nextUser && sessionOnly) {
        await firebaseSignOut(auth);
        return;
      }

      if (!isCancelled) setUser(nextUser);

      if (nextUser) {
        const storedProfile = await storage.getItem(`profile:${nextUser.uid}`);
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile) as Profile;
            if (
              typeof parsed?.firstName === "string" &&
              typeof parsed?.lastName === "string" &&
              typeof parsed?.profilePhotoUri === "string"
            ) {
              if (!isCancelled) setProfile(parsed);
            }
          } catch {
            // ignore
          }
        } else {
          if (!isCancelled) setProfile({ firstName: "", lastName: "", profilePhotoUri: "" });
        }
      } else {
        if (!isCancelled) setProfile({ firstName: "", lastName: "", profilePhotoUri: "" });
      }

      if (!isCancelled) setIsHydrated(true);
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [auth]);

  useEffect(() => {
    void storage.setItem("rememberMe", rememberMe ? "true" : "false");
    if (rememberMe) void storage.setItem("sessionOnly", "false");
  }, [rememberMe]);

  const persistProfile = (next: Profile) => {
    setProfile(next);
    if (auth?.currentUser?.uid) void storage.setItem(`profile:${auth.currentUser.uid}`, JSON.stringify(next));
  };

  const ensureAuthPersistence = async () => {
    if (!auth) throw new Error("Firebase is not configured. See .env.example.");
    if (Platform.OS === "web") {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    } else {
      await storage.setItem("sessionOnly", rememberMe ? "false" : "true");
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase is not configured. See .env.example.");
    await ensureAuthPersistence();
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase is not configured. See .env.example.");
    await ensureAuthPersistence();
    await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  };

  const completeGoogleSignIn = async ({ idToken, accessToken }: { idToken: string; accessToken?: string }) => {
    if (!auth) throw new Error("Firebase is not configured. See .env.example.");
    await ensureAuthPersistence();
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    await signInWithCredential(auth, credential);
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth) throw new Error("Firebase is not configured. See .env.example.");
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) throw new Error("No authenticated user.");

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await firebaseUpdatePassword(currentUser, newPassword);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoggedIn: Boolean(user),
      rememberMe,
      isHydrated,
      signInWithEmail,
      signUpWithEmail,
      completeGoogleSignIn,
      signOut,
      changePassword,
      setProfile: persistProfile,
      setRememberMe,
    }),
    [user, profile, rememberMe, isHydrated]
  );

  return (
    <ThemeProvider>
      <AuthFlowContext.Provider value={value}>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthFlowContext.Provider>
    </ThemeProvider>
  );
}
