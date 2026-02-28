import React, { useMemo } from "react";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuthFlow } from "./_layout";

export default function HomeScreen() {
  const { profile, setCredentials, setProfile } = useAuthFlow();

  const fullName = useMemo(
    () => `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User",
    [profile.firstName, profile.lastName]
  );

  const logout = () => {
    setCredentials(null);
    setProfile({ firstName: "", lastName: "", profilePhotoUri: "" });
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Homepage</Text>
          <Text style={styles.subtitle}>You are signed in.</Text>

          {profile.profilePhotoUri ? <Image source={{ uri: profile.profilePhotoUri }} style={styles.avatar} /> : null}
          <Text style={styles.profileName}>{fullName}</Text>

          <Pressable style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef2f7" },
  container: { flex: 1, justifyContent: "center", padding: 18 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d7deea",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  subtitle: { marginTop: 6, marginBottom: 14, color: "#475569", fontSize: 14 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  profileName: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 6,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
});
