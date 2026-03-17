
import { GoogleGenAI } from "@google/genai";

// Fix: Initializing GoogleGenAI with the required named parameter and strictly using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMnemonic = async (hexagramName: string, guaci: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是易经大师。请为“${hexagramName}”卦（卦辞：${guaci}）提供一句话的“一句话逻辑”辅助记忆。要求：语言精炼，通俗易懂，带有一点画面感。`,
    });
    // Fix: Accessing .text property directly (without calling as a method) as per guidelines
    return response.text?.trim() || "易道深远，静心感悟。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "天行健，君子以自强不息。";
  }
};

export const getDailyInsight = async (hexagramName: string, meaning: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是易经大师。请为“${hexagramName}”卦（卦意：${meaning}）提供以下内容：
1. 一个极具画面感的助记词（15字以内）。
2. 一个现代生活或职场场景的应用解析（30-50字）。
请以JSON格式返回，格式如下：
{
  "mnemonic": "助记词内容",
  "scenario": "场景应用内容"
}`,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Daily Insight Error:", error);
    return {
      mnemonic: "画面感助记词生成中...",
      scenario: "现代场景应用解析生成中..."
    };
  }
};

export const getQuizHint = async (hexagramName: string, upper: string, lower: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `题目关于“${hexagramName}”卦，其上卦为${upper}，下卦为${lower}。请给出一个不直接透漏答案的意象提示。`,
    });
    // Fix: Accessing .text property directly
    return response.text?.trim() || "观察自然界中水与火的关系...";
  } catch (error) {
    return "想想这个卦象在自然界对应的景致。";
  }
};
