import { analyzeImage } from "@/lib/gemini";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PROMPTS: Record<string, string> = {
  academic: `
Act as a university professor. Analyze this image in an academic way.

Identify:
1. Objects - list the distinct physical objects you see
2. Context - describe the educational or academic setting
3. Activities - explain what learning activity appears to be happening, if any
4. Recommendations - give one constructive academic suggestion

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`,

  safety: `
Act as a workplace safety inspector. Analyze this image for safety concerns.

Identify:
1. Objects - list the distinct physical objects you see
2. Context - describe the visible environment
3. Activities - explain what activity appears to be happening, if any
4. Recommendations - identify hazards, risks, or state clearly if no obvious hazard is visible

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`,

  inventory: `
Act as an asset management clerk. Analyze this image as an inventory record.

Identify:
1. Objects - list every visible physical asset
2. Context - briefly describe where the assets appear to be located
3. Activities - describe any visible usage or activity, if any
4. Recommendations - give one inventory-related suggestion

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`,
};

type Analysis = {
  objects: string[];
  context: string;
  activities: string;
  recommendations: string;
};

function cleanJsonText(text: string) {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/```json/g, "");
  cleaned = cleaned.replace(/```/g, "");
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export default function ResultScreen() {
  const { base64Image, promptKey } = useLocalSearchParams<{
    base64Image?: string;
    promptKey?: string;
  }>();

  const insets = useSafeAreaInsets();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const imageBase64 = Array.isArray(base64Image) ? base64Image[0] : base64Image;

  const selectedPromptKey = Array.isArray(promptKey)
    ? promptKey[0]
    : promptKey || "academic";

  const prompt = PROMPTS[selectedPromptKey] || PROMPTS.academic;

  const runAnalysis = useCallback(async () => {
    if (!imageBase64) {
      setError("No image data found. Please retake the photo.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(imageBase64, prompt);

      const textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textPart) {
        throw new Error("Empty response from Gemini");
      }

      const cleanedText = cleanJsonText(textPart);
      const parsed = JSON.parse(cleanedText);

      setAnalysis({
        objects: Array.isArray(parsed.objects) ? parsed.objects : [],
        context: parsed.context || "No context returned.",
        activities: parsed.activities || "No activities returned.",
        recommendations:
          parsed.recommendations || "No recommendations returned.",
      });
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      setError("Could not analyze this image. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [imageBase64, prompt]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <StatusBar style="dark" />

        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={runAnalysis}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.centered}>
        <StatusBar style="dark" />
        <Text style={styles.errorText}>No analysis result found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <StatusBar style="dark" />

      <Text style={styles.title}>AI Image Analysis</Text>
      <Text style={styles.modeText}>Mode: {selectedPromptKey}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Objects</Text>

        {analysis.objects.length === 0 ? (
          <Text style={styles.bodyText}>No objects listed.</Text>
        ) : (
          analysis.objects.map((obj, index) => (
            <Text key={`${obj}-${index}`} style={styles.listItem}>
              • {obj}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Context</Text>
        <Text style={styles.bodyText}>{analysis.context}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Activities</Text>
        <Text style={styles.bodyText}>{analysis.activities}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        <Text style={styles.bodyText}>{analysis.recommendations}</Text>
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Take Another Photo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F7F7FB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2A44",
    marginBottom: 6,
  },
  modeText: {
    color: "#5A6472",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    ...cardShadow,
  },
  loadingText: {
    marginTop: 12,
    color: "#5A6472",
  },
  errorText: {
    color: "#B3261E",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2A44",
    marginBottom: 6,
  },
  listItem: {
    fontSize: 15,
    marginTop: 4,
    color: "#2B2F38",
  },
  bodyText: {
    fontSize: 15,
    marginTop: 4,
    color: "#2B2F38",
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#5B3FA3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: "#5A6472",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  doneButton: {
    backgroundColor: "#5B3FA3",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
