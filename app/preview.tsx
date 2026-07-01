import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PreviewScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();

  function handleRetake() {
    router.back();
  }

  function handleAnalyze() {
    Alert.alert(
      "Coming Soon",
      "Image analysis will be available in a future update.",
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {uri && (
        <Image source={{ uri }} style={styles.preview} resizeMode="contain" />
      )}

      <View style={styles.buttonBar}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetake}
          activeOpacity={0.8}
        >
          <Text style={styles.retakeButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          activeOpacity={0.8}
        >
          <Text style={styles.analyzeButtonText}>Analyze</Text>
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
  },
  buttonBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 16,
    backgroundColor: "#000",
  },
  retakeButton: {
    flex: 1,
    paddingVertical: 16,
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
  analyzeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});
