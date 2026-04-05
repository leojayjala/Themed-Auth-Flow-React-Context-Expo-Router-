import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ThemeToggle } from "./_components/ThemeToggle";
import { GoogleAuthButton } from "./_components/GoogleAuthButton";
import { useAuthFlow } from "./_layout";
import { getFirebaseAuthErrorMessage } from "./_firebaseAuthErrors";
import { getStatusBarStyle, useTheme } from "./_theme";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { theme, themeName } = useTheme();
  const { rememberMe, setRememberMe, signInWithEmail } = useAuthFlow();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isFirebaseConfigured = Boolean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await signInWithEmail(values.email, values.password);
      router.replace("/");
    } catch (e) {
      setFormError(getFirebaseAuthErrorMessage(e));
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.screen }]}>
      <StatusBar style={getStatusBarStyle(themeName)} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.colors.title }]}>Login</Text>
              <ThemeToggle />
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>Enter your email and password.</Text>

            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        borderColor: theme.colors.inputBorder,
                        color: theme.colors.text,
                      },
                      error ? { borderColor: theme.colors.danger } : null,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.placeholder}
                  />
                  {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters.",
                },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
                  <View style={[styles.inputRow, { borderColor: error ? theme.colors.danger : theme.colors.inputBorder }]}>
                    <TextInput
                      style={[
                        styles.inputInner,
                        {
                          backgroundColor: theme.colors.inputBackground,
                          color: theme.colors.text,
                        },
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                      placeholder="Enter password"
                      placeholderTextColor={theme.colors.placeholder}
                    />
                    <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                      <Text style={[styles.inlineAction, { color: theme.colors.primary }]}>
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Pressable
              accessibilityRole="checkbox"
              onPress={() => setRememberMe(!rememberMe)}
              style={[styles.rememberRow, { borderColor: theme.colors.border }]}
            >
              <View style={[styles.rememberBox, { borderColor: theme.colors.inputBorder }]}>
                <View
                  style={[
                    styles.rememberDot,
                    { backgroundColor: rememberMe ? theme.colors.primary : "transparent" },
                  ]}
                />
              </View>
              <Text style={[styles.rememberText, { color: theme.colors.mutedText }]}>Remember me</Text>
            </Pressable>

            {formError ? <Text style={[styles.error, { color: theme.colors.danger }]}>{formError}</Text> : null}

            <Pressable
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary, opacity: !isValid || isSubmitting ? 0.6 : 1 },
              ]}
              disabled={!isValid || isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Text>
            </Pressable>

            <Text style={[styles.or, { color: theme.colors.mutedText }]}>or</Text>
            <GoogleAuthButton label="Continue with Google" />
            {!isFirebaseConfigured ? (
              <Text style={[styles.envHint, { color: theme.colors.danger }]}>
                Missing Firebase env vars. Create a `.env` file from `.env.example` and restart Expo.
              </Text>
            ) : null}

            <Link href="/register" asChild>
              <Pressable>
                <Text style={[styles.link, { color: theme.colors.primary }]}>Need an account? Register</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 18 },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { marginTop: 6, marginBottom: 14, fontSize: 14 },
  fieldWrap: { marginBottom: 10 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: { marginTop: 5, fontSize: 12 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
  },
  inlineAction: { fontWeight: "800", fontSize: 12, paddingVertical: 10 },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
    marginBottom: 10,
  },
  rememberBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberDot: { width: 10, height: 10, borderRadius: 3 },
  rememberText: { fontSize: 13, fontWeight: "700" },
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { fontWeight: "700", fontSize: 14 },
  or: { textAlign: "center", marginTop: 14, fontWeight: "800", fontSize: 12 },
  envHint: { marginTop: 10, fontSize: 12, textAlign: "center", fontWeight: "700" },
  link: { textAlign: "center", marginTop: 14, fontWeight: "700" },
});
