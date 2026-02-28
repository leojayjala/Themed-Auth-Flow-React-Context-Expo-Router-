import React from "react";
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
import { useAuthFlow } from "./_layout";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const { credentials } = useAuthFlow();
  const { control, handleSubmit, setError } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    const email = values.email.trim().toLowerCase();

    if (!credentials || credentials.email !== email || credentials.password !== values.password) {
      setError("root", { message: "Invalid email or password." });
      return;
    }

    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter your email and password.</Text>

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
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@example.com"
                  />
                  {error ? <Text style={styles.error}>{error.message}</Text> : null}
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
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    placeholder="Enter password"
                  />
                  {error ? <Text style={styles.error}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="root"
              render={({ fieldState: { error } }) =>
                error ? <Text style={styles.error}>{error.message}</Text> : null
              }
            />

            <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>

            <Link href="/register" asChild>
              <Pressable>
                <Text style={styles.link}>Need an account? Register</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef2f7" },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 18 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d7deea",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 6, marginBottom: 14, color: "#475569", fontSize: 14 },
  fieldWrap: { marginBottom: 10 },
  label: { fontSize: 13, marginBottom: 6, color: "#1e293b", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  inputError: { borderColor: "#b42318" },
  error: { marginTop: 5, color: "#b42318", fontSize: 12 },
  button: {
    marginTop: 8,
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  link: { textAlign: "center", marginTop: 14, color: "#1d4ed8", fontWeight: "700" },
});
