import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const model = "gemini-3-flash-preview";

export async function generateResumeSuggestions(resumeData: any) {
  const prompt = `You are an expert resume consultant. Analyze the following resume data and provide 3-5 specific, actionable suggestions to improve it. Focus on impact, keywords, and professional tone.
  
  Resume Data:
  ${JSON.stringify(resumeData, null, 2)}
  
  Return the suggestions as a JSON array of strings.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function optimizeBulletPoint(bulletPoint: string, jobTitle: string) {
  const prompt = `Optimize the following resume bullet point for a ${jobTitle} position. Use strong action verbs and quantify achievements if possible.
  
  Original: ${bulletPoint}
  
  Return only the optimized bullet point string.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text?.trim() || bulletPoint;
}

export async function generateInterviewQuestions(jobTitle: string, jobDescription: string) {
  const prompt = `You are a senior hiring manager. Generate 5 challenging interview questions for a ${jobTitle} role based on this description:
  
  Description: ${jobDescription}
  
  Return the questions as a JSON array of objects with 'id' and 'question' fields.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const questions = JSON.parse(response.text || "[]");
  return questions.map((q: any, index: number) => ({
    ...q,
    id: q.id || `q-${Date.now()}-${index}`
  }));
}

export async function getInterviewFeedback(question: string, answer: string) {
  const prompt = `You are an interview coach. Provide constructive feedback on the following interview answer.
  
  Question: ${question}
  User Answer: ${answer}
  
  Provide:
  1. A score from 1-10.
  2. Strengths of the answer.
  3. Areas for improvement.
  4. A suggested "perfect" answer.
  
  Return the feedback as a JSON object with fields: 'score', 'strengths' (array), 'improvements' (array), 'suggestedAnswer' (string).`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || "{}");
}
