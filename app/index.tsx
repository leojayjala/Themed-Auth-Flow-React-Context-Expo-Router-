import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthFlow } from "./_layout";
import { useTheme } from "./_theme";

export default function Index() {
  const { isHydrated, isLoggedIn } = useAuthFlow();
  const { theme } = useTheme();

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(isLoggedIn ? "/home" : "/login");
  }, [isHydrated, isLoggedIn]);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.screen }]}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center" },
});
