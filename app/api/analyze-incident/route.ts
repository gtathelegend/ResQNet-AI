import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      location,
      severity,
      description,
      peopleAffected,
      medicalEmergency,
      waterNeeded,
      foodNeeded,
      shelterNeeded,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API Key is configured, use the official SDK
    if (apiKey && apiKey !== "your-gemini-api-key" && apiKey !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using stable and fast gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          You are the ResQNet AI Incident Classifier. Your task is to analyze the following disaster report and generate tactical rescue recommendations.
          
          Input Report:
          - Disaster Type: ${type}
          - Severity Level: ${severity}
          - Location: ${location}
          - People Affected: ${peopleAffected}
          - Description: ${description}
          - Resource Needs Checklist:
            * Medical Emergency: ${medicalEmergency ? "Yes" : "No"}
            * Water Needed: ${waterNeeded ? "Yes" : "No"}
            * Food Needed: ${foodNeeded ? "Yes" : "No"}
            * Shelter Needed: ${shelterNeeded ? "Yes" : "No"}

          Analyze the situation and output a JSON response. The JSON object must strictly match the following schema:
          {
            "priority": "low" | "medium" | "high" | "critical",
            "reason": "Detailed explanation of why this priority rating was selected, referencing the description details.",
            "requiredResources": ["List of 3-5 specific emergency response units or supply items needed."],
            "estimatedResponseTime": "Estimated arrival/action timeframe (e.g. '15-30 minutes' or '1-2 hours').",
            "potentialRisks": ["List of 2-3 escalation hazards (e.g. structure collapse, hazardous runoff, grid blackout)."],
            "summary": "Concise 2-3 sentence overview briefing for HQ commanders."
          }

          Ensure to output ONLY valid JSON. Do not include markdown wraps (e.g. \`\`\`json).
        `;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const textResponse = result.response.text();
        const parsedAnalysis = JSON.parse(textResponse);

        return NextResponse.json({
          analysis: {
            ...parsedAnalysis,
            approved: false,
          },
        });
      } catch (geminiError) {
        console.error(
          "Gemini API call failed, falling back to mock analyser:",
          geminiError
        );
        // Fallthrough to mock analyzer on API query error
      }
    }

    // 2. Mock Fallback Analyser (If API Key is missing or failed)
    // Add artificial loading delay to simulate real AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Determine priority
    let priority: "low" | "medium" | "high" | "critical" = "medium";
    if (severity === "critical" || peopleAffected > 200) {
      priority = "critical";
    } else if (severity === "high" || medicalEmergency) {
      priority = "high";
    } else if (severity === "low") {
      priority = "low";
    }

    // Formulate mock intelligence reports depending on category
    let reason = "";
    let requiredResources: string[] = [];
    let estimatedResponseTime = "30-45 minutes";
    let potentialRisks: string[] = [];
    let summary = "";

    const cleanType = (type || "").toLowerCase();

    if (cleanType.includes("flooding") || cleanType.includes("water")) {
      reason = `Flooding reported at ${location} affecting approximately ${peopleAffected} people. Description indicates breaching waters. Priority set to ${priority.toUpperCase()} due to rapid water velocity and potential blockages of primary evacuation arteries.`;
      requiredResources = [
        "Amphibious Search & Rescue Units",
        "Sandbag Deployment Staging Vehicles",
        "Drinking Water Supply Tankers",
        "Thermal Blankets & Tents",
      ];
      estimatedResponseTime =
        priority === "critical" ? "20-30 minutes" : "45-60 minutes";
      potentialRisks = [
        "Submerged power grid transformers causing electrocution risks.",
        "Sewer and water lines contamination.",
        "Washout of residential structural foundations.",
      ];
      summary = `Incident confirms flooding in ${location}. Evacuation coordinates are being mapped. Local staging depot B notified to deploy barriers and freshwater resources.`;
    } else if (cleanType.includes("fire") || cleanType.includes("smoke")) {
      reason = `Fire hazard reported at ${location} affecting ${peopleAffected} people. Priority classified as ${priority.toUpperCase()} due to high wind dispersion risk and thermal radiation proximity to adjacent structures.`;
      requiredResources = [
        "HQ Pumper Fire Engines",
        "Smoke Inhalation Oxygen Kits",
        "Police Blockade Units",
        "Volunteers for Perimeter Safety",
      ];
      estimatedResponseTime = "15-20 minutes";
      potentialRisks = [
        "Plume toxicity causing respiratory distress in surrounding sectors.",
        "Risk of fuel/container explosions.",
        "Wind shifting fire direction toward residential blocks.",
      ];
      summary = `Active structure fire under assessment at ${location}. First responder units are on route with oxygen assets. Safe perimeter established by local police.`;
    } else if (cleanType.includes("medical")) {
      reason = `Mass casualty or medical emergency alert in ${location}. Priority raised to ${priority.toUpperCase()} due to direct life threats and necessity for triage staging.`;
      requiredResources = [
        "ALS Paramedic Ambulances",
        "Mobile Medical Triage Tents",
        "Emergency Blood Supply Units",
      ];
      estimatedResponseTime = "10-15 minutes";
      potentialRisks = [
        "Depletion of nearby hospital emergency room capacity.",
        "Difficulty accessing victims due to structural blockages.",
      ];
      summary = `Emergency medical crisis reported. Paramedic dispatches prioritized. Triage station set up at Sector B hub.`;
    } else {
      // General/Other Triage
      reason = `Emergency signal logged for ${type} at ${location}. Priority set to ${priority.toUpperCase()} based on description logs and estimated impact of ${peopleAffected} affected citizens.`;
      requiredResources = [
        "General Telemetry Support Units",
        "Civil Defense Volunteers",
        "Triage Supplies Staging Group",
      ];
      estimatedResponseTime = "30-40 minutes";
      potentialRisks = [
        "Inadequate volunteer staging near location.",
        "Communication signal dropouts due to power fluctuations.",
      ];
      summary = `General disaster response signal active at ${location}. Responders instructed to coordinate with local volunteer commanders for dispatch parameters.`;
    }

    return NextResponse.json({
      analysis: {
        priority,
        reason,
        requiredResources,
        estimatedResponseTime,
        potentialRisks,
        summary,
        approved: false,
      },
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal AI Analyser error.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
