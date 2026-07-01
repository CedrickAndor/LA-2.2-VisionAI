import * as FileSystem from "expo-file-system/legacy";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message?: string;
  };
};

export async function imageToBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return base64;
}

export async function analyzeImage(
  base64Image: string,
  prompt: string,
): Promise<GeminiResponse> {
  if (!GEMINI_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_KEY in .env");
  }

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    }),
  });

  const json = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(
      json.error?.message || `Gemini request failed: ${response.status}`,
    );
  }

  return json;
}
