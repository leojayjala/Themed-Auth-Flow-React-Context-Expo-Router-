import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthFlow } from "./_layout";
import { useTheme } from "./_theme";

export default function Index() {
  const { isHydrated, user, profile } = useAuthFlow();
  const { theme } = useTheme();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const hasProfile = Boolean(profile.firstName && profile.lastName);
    router.replace(hasProfile ? "/home" : "/setup");
  }, [isHydrated, user, profile.firstName, profile.lastName]);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.screen }]}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center" },
});
