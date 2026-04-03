import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ThemeToggle } from "./_components/ThemeToggle";
import { useAuthFlow } from "./_layout";
import { getStatusBarStyle, useTheme } from "./_theme";

type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function ChangePasswordScreen() {
  const { theme, themeName } = useTheme();
  const { credentials, isHydrated, isLoggedIn, setCredentials } = useAuthFlow();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn || !credentials) router.replace("/login");
  }, [isHydrated, isLoggedIn, credentials]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<ChangePasswordFormValues>({
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
    mode: "onChange",
  });

  const newPassword = watch("newPassword");

  const onSubmit = (values: ChangePasswordFormValues) => {
    if (!credentials) return;

    setCredentials({ ...credentials, password: values.newPassword });
    Alert.alert("Success", "Your password has been updated.");
    router.replace("/home");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.screen }]}>
      <StatusBar style={getStatusBarStyle(themeName)} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()}>
                <Text style={[styles.backText, { color: theme.colors.primary }]}>Back</Text>
              </Pressable>
              <ThemeToggle />
            </View>

            <Text style={[styles.title, { color: theme.colors.title }]}>Change Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>Update your password (local only).</Text>

            <Controller
              control={control}
              name="currentPassword"
              rules={{
                required: "Current password is required.",
                validate: (value: string) =>
                  !credentials || value === credentials.password || "Incorrect current password.",
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Current Password</Text>
                  <View style={[styles.inputRow, { borderColor: error ? theme.colors.danger : theme.colors.inputBorder }]}>
                    <TextInput
                      style={[
                        styles.inputInner,
                        { backgroundColor: theme.colors.inputBackground, color: theme.colors.text },
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showCurrent}
                      placeholder="Enter current password"
                      placeholderTextColor={theme.colors.placeholder}
                    />
                    <Pressable onPress={() => setShowCurrent((prev) => !prev)}>
                      <Text style={[styles.inlineAction, { color: theme.colors.primary }]}>
                        {showCurrent ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: "New password is required.",
                minLength: { value: 6, message: "New password must be at least 6 characters." },
                validate: (value: string) => (!credentials || value !== credentials.password ? true : "Use a new password."),
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>New Password</Text>
                  <View style={[styles.inputRow, { borderColor: error ? theme.colors.danger : theme.colors.inputBorder }]}>
                    <TextInput
                      style={[
                        styles.inputInner,
                        { backgroundColor: theme.colors.inputBackground, color: theme.colors.text },
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showNew}
                      placeholder="Enter new password"
                      placeholderTextColor={theme.colors.placeholder}
                    />
                    <Pressable onPress={() => setShowNew((prev) => !prev)}>
                      <Text style={[styles.inlineAction, { color: theme.colors.primary }]}>
                        {showNew ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmNewPassword"
              rules={{
                required: "Confirm new password is required.",
                validate: (value: string) => value === newPassword || "Passwords do not match.",
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Confirm New Password</Text>
                  <View style={[styles.inputRow, { borderColor: error ? theme.colors.danger : theme.colors.inputBorder }]}>
                    <TextInput
                      style={[
                        styles.inputInner,
                        { backgroundColor: theme.colors.inputBackground, color: theme.colors.text },
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showConfirm}
                      placeholder="Re-enter new password"
                      placeholderTextColor={theme.colors.placeholder}
                    />
                    <Pressable onPress={() => setShowConfirm((prev) => !prev)}>
                      <Text style={[styles.inlineAction, { color: theme.colors.primary }]}>
                        {showConfirm ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Pressable
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary, opacity: !isValid || isSubmitting ? 0.6 : 1 },
              ]}
              disabled={!isValid || isSubmitting}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Text>
            </Pressable>
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
  card: { borderRadius: 14, padding: 16, borderWidth: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backText: { fontSize: 12, fontWeight: "800" },
  title: { fontSize: 22, fontWeight: "800", marginTop: 10 },
  subtitle: { marginTop: 6, marginBottom: 14, fontSize: 14 },
  fieldWrap: { marginBottom: 10 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: "600" },
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
  error: { marginTop: 5, fontSize: 12 },
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { fontWeight: "800", fontSize: 14 },
});

