import { imageToBase64 } from "@/lib/gemini";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PromptKey = "academic" | "safety" | "inventory";

export default function PreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const [analyzingKey, setAnalyzingKey] = useState<PromptKey | null>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const photoUri = Array.isArray(uri) ? uri[0] : uri;
  const isTablet = width >= 768;

  function handleRetake() {
    router.back();
  }

  async function handleAnalyze(promptKey: PromptKey) {
    if (!photoUri) {
      Alert.alert("No Image", "Please retake a photo first.");
      return;
    }

    try {
      setAnalyzingKey(promptKey);

      const base64Image = await imageToBase64(photoUri);

      router.push({
        pathname: "/result",
        params: {
          base64Image,
          promptKey,
        },
      });
    } catch (error) {
      console.error("Failed to prepare image:", error);
      Alert.alert("Error", "Could not prepare this image for analysis.");
    } finally {
      setAnalyzingKey(null);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={[styles.preview, { maxWidth: isTablet ? 600 : "100%" }]}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.missingImageContainer}>
          <Text style={styles.missingImageText}>No image found.</Text>
        </View>
      )}

      <View style={[styles.buttonBar, { paddingBottom: insets.bottom + 18 }]}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          activeOpacity={0.8}
          disabled={analyzingKey !== null}
        >
          <Text style={styles.retakeButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.personaButton}
          onPress={() => handleAnalyze("academic")}
          activeOpacity={0.8}
          disabled={analyzingKey !== null}
        >
          {analyzingKey === "academic" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.personaButtonText}>Academic Analysis</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.personaButton}
          onPress={() => handleAnalyze("safety")}
          activeOpacity={0.8}
          disabled={analyzingKey !== null}
        >
          {analyzingKey === "safety" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.personaButtonText}>Safety Analysis</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.personaButton}
          onPress={() => handleAnalyze("inventory")}
          activeOpacity={0.8}
          disabled={analyzingKey !== null}
        >
          {analyzingKey === "inventory" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.personaButtonText}>Inventory Analysis</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  preview: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
  missingImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  missingImageText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonBar: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "#000",
  },
  retakeButton: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ffffff",
    alignItems: "center",
  },
  retakeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  personaButton: {
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#5B3FA3",
    alignItems: "center",
  },
  personaButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
