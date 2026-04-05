import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useAuthFlow } from "../_layout";
import { useTheme } from "../_theme";
import { getFirebaseAuthErrorMessage } from "../_firebaseAuthErrors";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  label: string;
};

function getGoogleClientConfig() {
  // `expo-auth-session` throws if the platform clientId is `undefined`.
  // Use empty strings as safe defaults and disable the button when missing.
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "";

  return { webClientId, iosClientId, androidClientId };
}

export function GoogleAuthButton({ label }: Props) {
  const { theme } = useTheme();
  const config = useMemo(() => getGoogleClientConfig(), []);
  const isConfiguredForThisPlatform =
    Platform.OS === "web"
      ? config.webClientId.length > 0
      : config.iosClientId.length > 0 || config.androidClientId.length > 0;

  if (!isConfiguredForThisPlatform) {
    return (
      <>
        <Pressable
          disabled
          style={[styles.button, { borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.card, opacity: 0.6 }]}
        >
          <Text style={[styles.text, { color: theme.colors.text }]}>{label}</Text>
        </Pressable>
        <Text style={[styles.hint, { color: theme.colors.mutedText }]}>
          Google sign-in not configured for this platform (set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` for web, or iOS/Android client IDs for native).
        </Text>
      </>
    );
  }

  return <GoogleAuthButtonConfigured label={label} config={config} />;
}

function GoogleAuthButtonConfigured({
  label,
  config,
}: {
  label: string;
  config: { webClientId: string; iosClientId: string; androidClientId: string };
}) {
  const { theme } = useTheme();
  const { completeGoogleSignIn } = useAuthFlow();
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const redirectUri =
    Platform.OS === "web" && typeof window !== "undefined" ? `${window.location.origin}/--/oauthredirect` : undefined;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: config.webClientId,
    iosClientId: config.iosClientId,
    androidClientId: config.androidClientId,
    redirectUri,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const run = async () => {
      if (response?.type !== "success") return;
      setError(null);
      setIsWorking(true);
      try {
        const anyResponse: any = response;
        const idToken: string | undefined =
          anyResponse?.authentication?.idToken ?? anyResponse?.params?.id_token ?? anyResponse?.params?.idToken;
        const accessToken: string | undefined =
          anyResponse?.authentication?.accessToken ??
          anyResponse?.params?.access_token ??
          anyResponse?.params?.accessToken;

        if (!idToken) {
          setError("Google sign-in is missing an ID token. Check your Google OAuth client settings.");
          return;
        }

        await completeGoogleSignIn({ idToken, accessToken });
        router.replace("/");
      } catch (e) {
        setError(getFirebaseAuthErrorMessage(e));
      } finally {
        setIsWorking(false);
      }
    };

    run();
  }, [response, completeGoogleSignIn]);

  return (
    <>
      <Pressable
        disabled={!request || isWorking}
        onPress={async () => {
          setError(null);
          if (!request) return;
          try {
            setIsWorking(true);
            await promptAsync();
          } catch (e) {
            setError(getFirebaseAuthErrorMessage(e));
          } finally {
            setIsWorking(false);
          }
        }}
        style={[
          styles.button,
          { borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.card },
          (!request || isWorking) ? { opacity: 0.6 } : null,
        ]}
      >
        {isWorking ? <ActivityIndicator /> : <Text style={[styles.text, { color: theme.colors.text }]}>{label}</Text>}
      </Pressable>
      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  text: { fontWeight: "800", fontSize: 14 },
  error: { marginTop: 8, fontSize: 12 },
  hint: { marginTop: 8, fontSize: 12, textAlign: "center" },
});
