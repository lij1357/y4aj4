
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Converts a File object to a base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generates SRT subtitles from an audio file.
 */
export const generateSubtitles = async (
  file: File,
  glossary: string[]
): Promise<string> => {
  try {
    const base64Data = await fileToBase64(file);
    const mimeType = file.type || 'audio/mpeg';
    
    const glossaryText = glossary.length > 0 
      ? `請優先正確識別以下專有名詞：${glossary.join(', ')}。` 
      : "";

    const prompt = `
      你是一個專業的影片字幕轉錄員。
      任務：將這段音檔轉錄為精確的字幕，並嚴格遵循 SRT 格式。
      
      規則：
      1. 使用繁體中文。
      2. 格式必須為：
         [序號]
         [HH:mm:ss,mmm] --> [HH:mm:ss,mmm]
         [字幕內容]
      3. ${glossaryText}
      4. 請確保時間戳記與語音內容精確對齊。
      5. 輸出僅包含 SRT 內容，不要包含任何其他解釋。
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        }
      ],
      config: {
        temperature: 0.1, // Lower temperature for more consistent formatting
      }
    });

    const result = response.text || "";
    if (!result) throw new Error("AI 未回傳任何內容");
    
    return result.trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "產生字幕時發生錯誤，請稍後再試。");
  }
};
