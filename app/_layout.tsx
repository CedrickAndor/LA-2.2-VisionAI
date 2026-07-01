import { Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="result" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
