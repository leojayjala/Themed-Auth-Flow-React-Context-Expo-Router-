import React, { useEffect, useMemo } from "react";
import { Alert, Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuthFlow } from "./_layout";
import { ThemeToggle } from "./_components/ThemeToggle";
import { getStatusBarStyle, useTheme } from "./_theme";

export default function HomeScreen() {
  const { theme, themeName } = useTheme();
  const { isHydrated, user, profile, signOut } = useAuthFlow();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.replace("/login");
  }, [isHydrated, user]);

  const fullName = useMemo(
    () => `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User",
    [profile.firstName, profile.lastName]
  );

  const logout = () => {
    const run = async () => {
      try {
        await signOut();
      } finally {
        router.replace("/login");
      }
    };

    if (Platform.OS === "web") {
      const ok = globalThis.confirm?.("Are you sure you want to log out?") ?? true;
      if (ok) void run();
      return;
    }

    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => void run() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.screen }]}>
      <StatusBar style={getStatusBarStyle(themeName)} />
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.colors.title }]}>Homepage</Text>
            <ThemeToggle />
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>You are signed in.</Text>

          {profile.profilePhotoUri ? <Image source={{ uri: profile.profilePhotoUri }} style={styles.avatar} /> : null}
          <Text style={[styles.profileName, { color: theme.colors.text }]}>{fullName}</Text>
          {user?.email ? <Text style={[styles.email, { color: theme.colors.mutedText }]}>{user.email}</Text> : null}

          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
            onPress={() => router.push("/change-password" as any)}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>Change Password</Text>
          </Pressable>

          <Pressable style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={logout}>
            <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 18 },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { marginTop: 6, marginBottom: 14, fontSize: 14 },
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
    marginTop: 6,
  },
  email: { textAlign: "center", marginTop: 4, fontSize: 12, fontWeight: "700" },
  secondaryButton: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: { fontWeight: "800", fontSize: 14 },
  button: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { fontWeight: "700", fontSize: 14 },
});
