import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTheme } from "../_theme";

export function ThemeToggle() {
  const { theme, themeName, toggleTheme } = useTheme();

  const isDark = themeName === "dark";

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.colors.mutedText }]}>Dark mode</Text>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.card}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontSize: 12, fontWeight: "700" },
});

