import React from "react";
import {
  Alert,
  Image,
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
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import { ThemeToggle } from "./_components/ThemeToggle";
import { useAuthFlow } from "./_layout";
import { getStatusBarStyle, useTheme } from "./_theme";

type SetupFormValues = {
  profilePhotoUri: string;
  firstName: string;
  lastName: string;
};

export default function SetupScreen() {
  const { theme, themeName } = useTheme();
  const { setIsLoggedIn, setProfile } = useAuthFlow();
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<SetupFormValues>({
    defaultValues: { profilePhotoUri: "", firstName: "", lastName: "" },
    mode: "onChange",
  });

  const photoUri = watch("profilePhotoUri");

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow photo library access to choose a profile photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setValue("profilePhotoUri", result.assets[0].uri, { shouldValidate: true });
      await trigger("profilePhotoUri");
    }
  };

  const onSubmit = (values: SetupFormValues) => {
    setProfile({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      profilePhotoUri: values.profilePhotoUri,
    });

    setIsLoggedIn(true);
    router.replace("/home");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.screen }]}>
      <StatusBar style={getStatusBarStyle(themeName)} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.colors.title }]}>Setup Account</Text>
              <ThemeToggle />
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>Complete your profile.</Text>

            <Controller
              control={control}
              name="profilePhotoUri"
              rules={{ required: "Profile Photo is required." }}
              render={({ fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Profile Photo</Text>
                  <Pressable style={[styles.secondaryButton, { borderColor: theme.colors.primary }]} onPress={pickImage}>
                    <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
                      {photoUri ? "Change Photo" : "Choose Photo"}
                    </Text>
                  </Pressable>
                  {photoUri ? <Image source={{ uri: photoUri }} style={styles.avatar} /> : null}
                  {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="firstName"
              rules={{
                required: "First Name is required.",
                minLength: { value: 2, message: "First Name must be at least 2 characters." },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>First Name</Text>
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
                    autoCapitalize="words"
                    placeholder="First name"
                    placeholderTextColor={theme.colors.placeholder}
                  />
                  {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="lastName"
              rules={{
                required: "Last Name is required.",
                minLength: { value: 2, message: "Last Name must be at least 2 characters." },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Last Name</Text>
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
                    autoCapitalize="words"
                    placeholder="Last name"
                    placeholderTextColor={theme.colors.placeholder}
                  />
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
                {isSubmitting ? "Saving..." : "Finish Setup"}
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
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { fontWeight: "700", fontSize: 14 },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: { fontWeight: "700" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
});
