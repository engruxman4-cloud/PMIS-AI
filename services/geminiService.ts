import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, ProjectFile, AnalysisResult, FileType } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "A high-level summary of the project status based on PMBOK 8th Ed." },
    metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["good", "warning", "critical", "neutral"] },
          trend: { type: Type.STRING, enum: ["up", "down", "stable"] },
        },
        required: ["label", "value", "status"]
      }
    },
    chartData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Time period or Milestone" },
          planned: { type: Type.NUMBER },
          actual: { type: Type.NUMBER },
          forecast: { type: Type.NUMBER },
        },
        required: ["name", "planned", "actual"]
      }
    },
    forecasts: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    changeRequests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          reason: { type: Type.STRING },
        },
        required: ["title", "priority"]
      }
    },
    dataReadinessScore: { type: Type.NUMBER, description: "Score from 0 to 100 indicating data completeness" }
  },
  required: ["executiveSummary", "metrics", "chartData", "recommendations", "dataReadinessScore"]
};

export const analyzeProjectPerformance = async (
  mode: AppMode,
  files: ProjectFile[]
): Promise<AnalysisResult> => {
  
  // Choose model based on complexity
  const modelName = mode === AppMode.INTEGRATED_CONTROL 
    ? "gemini-3-pro-preview" 
    : "gemini-3-flash-preview";

  let promptContext = `You are a Senior Project Manager and PMIS AI Module expert in PMBOK Guide 8th Edition.
  
  Operational Mode: ${mode}

  Analyze the attached project files (documents, data sheets).
  
  CONTEXT FILES:
  ${files.map(f => `- [${f.type}] ${f.name} (Uploaded: ${f.uploadDate.toDateString()})`).join('\n')}
  
  TASK:
  Generate a strictly formatted JSON report.
  1. Validate data completeness (Data Readiness Score).
  2. Calculate variances (SV, CV) and Indices (SPI, CPI) based on the ACTUAL data in the files.
  3. Forecast trends (EAC, ETC).
  4. Recommend corrective actions.
  5. Identify if Change Requests are needed.
  
  SPECIFIC MODE INSTRUCTIONS:
  - If SCHEDULE_CONTROL: Focus on Critical Path, Schedule Variance (SV), Schedule Performance Index (SPI).
  - If FINANCIAL_CONTROL: Focus on Earned Value (EV), Cost Variance (CV), Cost Performance Index (CPI), EAC.
  - If INTEGRATED_CONTROL: Correlate Schedule delays to Cost impacts. Use "Thinking" to deep dive into the relationship between delayed milestones and burn rate.

  Note: If files are missing or unreadable, simulate a realistic scenario based on the file type names provided.
  `;

  // Construct request parts
  const parts: any[] = [];
  
  // Add the text prompt
  parts.push({
    text: promptContext
  });

  // Add file parts
  files.forEach(f => {
    // Only add if we have data. 
    // Gemini supports PDF, Text, and some Image formats via inlineData. 
    // For CSV/Text files, we can just send as text part or inlineData with text/plain or text/csv if supported.
    // For PDF, we send application/pdf.
    if (f.base64Data && f.mimeType) {
      parts.push({
        inlineData: {
          mimeType: f.mimeType,
          data: f.base64Data
        }
      });
    }
  });

  // Configuration
  const config = {
    responseMimeType: "application/json",
    responseSchema: ANALYSIS_SCHEMA,
    // Add thinking budget only for the pro model in integrated mode
    ...(mode === AppMode.INTEGRATED_CONTROL ? { thinkingConfig: { thinkingBudget: 1024 } } : {}),
  };

  try {
    const aiResponse = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: config
    });

    const textResponse = aiResponse.text;
    if (!textResponse) throw new Error("No response from AI");

    const parsedData = JSON.parse(textResponse);
    
    return {
      mode,
      timestamp: new Date(),
      ...parsedData
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback error result
    return {
      mode,
      timestamp: new Date(),
      executiveSummary: "Analysis failed due to API error. Please check your API key and file formats.",
      metrics: [],
      chartData: [],
      forecasts: [],
      risks: [],
      recommendations: ["Check API connectivity.", "Ensure files are PDF, CSV, or Text."],
      changeRequests: [],
      dataReadinessScore: 0
    };
  }
};
