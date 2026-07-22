import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VolunteerProfile } from "@/types/volunteer";

// Proximity calculation helper using Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      incidentType,
      severity,
      description,
      latitude,
      longitude,
      volunteers,
    } = body as {
      incidentType: string;
      severity: string;
      description: string;
      latitude: number;
      longitude: number;
      volunteers: VolunteerProfile[];
    };

    const apiKey = process.env.GEMINI_API_KEY;

    // Filter to available on-duty volunteers first
    const availableVolunteers = volunteers.filter(
      (v) => v.status === "on-duty"
    );

    if (availableVolunteers.length === 0) {
      return NextResponse.json({
        recommendations: [],
        justification:
          "No on-duty volunteers are currently available for dispatch.",
      });
    }

    // 1. If Gemini API Key is configured, use the official SDK
    if (apiKey && apiKey !== "your-gemini-api-key" && apiKey !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Augment volunteer data with pre-calculated distance to incident
        const volunteersWithDistance = availableVolunteers.map((v) => ({
          id: v.id,
          name: v.name,
          skills: v.skills,
          availability: v.availabilityHours,
          distanceKm: getDistanceKm(
            latitude,
            longitude,
            v.latitude,
            v.longitude
          ),
        }));

        const prompt = `
          You are the ResQNet AI Volunteer Matcher. Your task is to recommend the best volunteer matching candidates to deploy to an active emergency incident based on proximity (distance) and skillset.
          
          Incident Details:
          - Type: ${incidentType}
          - Severity: ${severity}
          - Location Coordinates: Latitude ${latitude}, Longitude ${longitude}
          - Description: ${description}

          Available Volunteers (with distance in kilometers from incident):
          ${JSON.stringify(volunteersWithDistance)}

          Match the best volunteer candidate for this incident.
          
          Output your response strictly in the following JSON format:
          {
            "recommendations": [
              {
                "volunteerId": "id of the volunteer",
                "volunteerName": "name of the volunteer",
                "role": "Suggested role for this dispatch (e.g. 'Evacuation Helper', 'Medical Responder')",
                "reason": "Brief explanation of why they are the best fit (e.g. 'Located only 1.2km away with Medical training')"
              }
            ],
            "justification": "A summary justification explaining the overall matching logic."
          }

          Output ONLY valid JSON. Do not include markdown wraps.
        `;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const parsedResult = JSON.parse(result.response.text());
        return NextResponse.json(parsedResult);
      } catch (geminiError) {
        console.error(
          "Gemini Volunteer Advisor failed, falling back to mock:",
          geminiError
        );
      }
    }

    // 2. Analytical Mock Fallback Matcher (If API key is missing or failed)
    // Delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Calculate distances and rank score based on proximity and matching skills
    const scoredVolunteers = availableVolunteers.map((v) => {
      const distance = getDistanceKm(
        latitude,
        longitude,
        v.latitude,
        v.longitude
      );

      let skillScore = 0;
      const cleanType = (incidentType || "").toLowerCase();

      v.skills.forEach((skill) => {
        const cleanSkill = skill.toLowerCase();
        if (
          cleanType.includes("flooding") &&
          (cleanSkill.includes("water") || cleanSkill.includes("swimm"))
        ) {
          skillScore += 5;
        }
        if (
          cleanType.includes("medical") &&
          (cleanSkill.includes("medic") || cleanSkill.includes("first aid"))
        ) {
          skillScore += 5;
        }
        if (
          cleanType.includes("fire") &&
          (cleanSkill.includes("debris") || cleanSkill.includes("heavy"))
        ) {
          skillScore += 3;
        }
        if (cleanSkill.includes("first aid") || cleanSkill.includes("triage")) {
          skillScore += 2; // general utility
        }
      });

      // Score formula: high skill score is good, lower distance is good.
      // Score = (skillScore * 2) - distance
      const score = skillScore * 2 - distance;

      return {
        volunteer: v,
        distance,
        score,
      };
    });

    // Sort by highest score
    scoredVolunteers.sort((a, b) => b.score - a.score);
    const bestMatch = scoredVolunteers[0];

    // Determine suggested role
    let suggestedRole = "General Support Responder";
    if (
      bestMatch.volunteer.skills.includes("Medical") ||
      bestMatch.volunteer.skills.includes("First Aid")
    ) {
      suggestedRole = "First Aid Responder";
    } else if (bestMatch.volunteer.skills.includes("Water Rescue")) {
      suggestedRole = "Flood Evacuation Rescue Helper";
    } else if (bestMatch.volunteer.skills.includes("Debris Removal")) {
      suggestedRole = "Clearance Operations Support";
    }

    const recommendation = {
      volunteerId: bestMatch.volunteer.id,
      volunteerName: bestMatch.volunteer.name,
      role: suggestedRole,
      reason: `Best scored candidate located ${bestMatch.distance} km away. Skillset (${bestMatch.volunteer.skills.join(", ")}) aligns with incident requirements.`,
    };

    return NextResponse.json({
      recommendations: [recommendation],
      justification: `AI identified ${bestMatch.volunteer.name} as the optimized deployment option. They are located ${bestMatch.distance} km away from the staging area and possess relevant ${bestMatch.volunteer.skills[0] || "emergency support"} skills.`,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Internal Volunteer Matching error.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
