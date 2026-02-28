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

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterScreen() {
  const { setCredentials } = useAuthFlow();
  const { control, handleSubmit, watch } = useForm<RegisterFormValues>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const onSubmit = (values: RegisterFormValues) => {
    setCredentials({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    router.replace("/setup");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Create your account.</Text>

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
              name="confirmPassword"
              rules={{
                required: "Confirm Password is required.",
                validate: (value: string) => value === password || "Passwords do not match.",
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry
                    placeholder="Re-enter password"
                  />
                  {error ? <Text style={styles.error}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonText}>Create Account</Text>
            </Pressable>

            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.link}>Already registered? Login</Text>
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
