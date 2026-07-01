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

import { imageToBase64 } from "../lib/gemini";

export default function PreviewScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const [converting, setConverting] = useState(false);
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  async function goAnalyze(promptKey) {
    try {
      setConverting(true);

      const base64Image = await imageToBase64(photoUri);

      navigation.navigate("Result", {
        base64Image,
        promptKey,
      });
    } catch (_error) {
      Alert.alert("Error", "Could not prepare the image for analysis.");
    } finally {
      setConverting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photoUri }}
        style={[
          styles.preview,
          {
            maxWidth: isTablet ? 600 : "100%",
          },
        ]}
      />

      {converting ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.loadingText}>Preparing image...</Text>
        </View>
      ) : (
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => goAnalyze("academic")}
          >
            <Text style={styles.buttonText}>Academic Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => goAnalyze("safety")}
          >
            <Text style={styles.buttonText}>Safety Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => goAnalyze("inventory")}
          >
            <Text style={styles.buttonText}>Inventory Analysis</Text>
          </TouchableOpacity>
        </View>
      )}
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
    resizeMode: "contain",
    alignSelf: "center",
  },

  bottomArea: {
    padding: 20,
    gap: 10,
  },

  retakeButton: {
    backgroundColor: "#5A6472",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  analyzeButton: {
    backgroundColor: "#5B3FA3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  loadingArea: {
    padding: 20,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 8,
    color: "#fff",
  },
});
