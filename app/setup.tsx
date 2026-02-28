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
import { useAuthFlow } from "./_layout";

type SetupFormValues = {
  profilePhotoUri: string;
  firstName: string;
  lastName: string;
};

export default function SetupScreen() {
  const { setProfile } = useAuthFlow();
  const { control, handleSubmit, setValue, trigger, watch } = useForm<SetupFormValues>({
    defaultValues: { profilePhotoUri: "", firstName: "", lastName: "" },
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

    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Setup Account</Text>
            <Text style={styles.subtitle}>Complete your profile.</Text>

            <Controller
              control={control}
              name="profilePhotoUri"
              rules={{ required: "Profile Photo is required." }}
              render={({ fieldState: { error } }) => (
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Profile Photo</Text>
                  <Pressable style={styles.secondaryButton} onPress={pickImage}>
                    <Text style={styles.secondaryButtonText}>{photoUri ? "Change Photo" : "Choose Photo"}</Text>
                  </Pressable>
                  {photoUri ? <Image source={{ uri: photoUri }} style={styles.avatar} /> : null}
                  {error ? <Text style={styles.error}>{error.message}</Text> : null}
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
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    placeholder="First name"
                  />
                  {error ? <Text style={styles.error}>{error.message}</Text> : null}
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
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    placeholder="Last name"
                  />
                  {error ? <Text style={styles.error}>{error.message}</Text> : null}
                </View>
              )}
            />

            <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.buttonText}>Finish Setup</Text>
            </Pressable>
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#1d4ed8", fontWeight: "700" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
});
