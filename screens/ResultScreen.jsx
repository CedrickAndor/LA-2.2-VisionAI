import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { analyzeImage } from "../lib/gemini";

const PROMPTS = {
  academic: `
Act as a university professor. Analyze this image in an academic way.

Respond ONLY with valid JSON in this exact shape:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}

Focus on visible objects, educational context, possible learning activity, and one constructive recommendation.
`,

  safety: `
Act as a workplace safety inspector. Analyze this image for safety concerns.

Respond ONLY with valid JSON in this exact shape:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}

Focus on visible objects, possible hazards, risks, unsafe arrangements, or state clearly if no obvious hazard is visible.
`,

  inventory: `
Act as an asset management clerk. Analyze this image as an inventory record.

Respond ONLY with valid JSON in this exact shape:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}

Focus on listing visible physical assets, describing the location, identifying any visible activity, and giving one inventory-related recommendation.
`,
};

function cleanJsonText(text) {
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

export default function ResultScreen({ route, navigation }) {
  const { base64Image, promptKey } = route.params;

  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const prompt = PROMPTS[promptKey] || PROMPTS.academic;

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(base64Image, prompt);

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
    } catch (_err) {
      setError("Could not analyze this image. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [base64Image, prompt]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={runAnalysis}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No analysis result found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Image Analysis</Text>

      <Text style={styles.modeText}>Mode: {promptKey || "academic"}</Text>

      <Text style={styles.sectionTitle}>Objects</Text>

      {analysis.objects.length === 0 ? (
        <Text style={styles.bodyText}>No objects listed.</Text>
      ) : (
        analysis.objects.map((obj, index) => (
          <Text key={index} style={styles.listItem}>
            • {obj}
          </Text>
        ))
      )}

      <Text style={styles.sectionTitle}>Context</Text>
      <Text style={styles.bodyText}>{analysis.context}</Text>

      <Text style={styles.sectionTitle}>Activities</Text>
      <Text style={styles.bodyText}>{analysis.activities}</Text>

      <Text style={styles.sectionTitle}>Recommendations</Text>
      <Text style={styles.bodyText}>{analysis.recommendations}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2A44",
    marginBottom: 6,
  },

  modeText: {
    color: "#5A6472",
    marginBottom: 16,
    textTransform: "capitalize",
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
    marginTop: 18,
    color: "#1F2A44",
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  backButton: {
    backgroundColor: "#5A6472",
    padding: 12,
    borderRadius: 8,
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
