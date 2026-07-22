import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResourceItem } from "@/types/resource";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      incidentType,
      severity,
      peopleAffected,
      medicalEmergency,
      waterNeeded,
      foodNeeded,
      shelterNeeded,
      inventory,
    } = body as {
      incidentType: string;
      severity: string;
      peopleAffected: number;
      medicalEmergency: boolean;
      waterNeeded: boolean;
      foodNeeded: boolean;
      shelterNeeded: boolean;
      inventory: ResourceItem[];
    };

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API Key is configured, use the official SDK
    if (apiKey && apiKey !== "your-gemini-api-key" && apiKey !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          You are the ResQNet AI Resource Advisor. Your task is to recommend exact resource allocation quantities from our available depot stocks based on the details of an active emergency incident.
          
          Active Incident Details:
          - Type: ${incidentType}
          - Severity: ${severity}
          - Affected Population: ${peopleAffected} people
          - Needs Checklist:
            * Medical Emergency: ${medicalEmergency ? "Yes" : "No"}
            * Water Needed: ${waterNeeded ? "Yes" : "No"}
            * Food Needed: ${foodNeeded ? "Yes" : "No"}
            * Shelter Needed: ${shelterNeeded ? "Yes" : "No"}

          Available Depot Stock Inventory:
          ${JSON.stringify(inventory)}

          Suggest recommended allocation quantities for ONLY the resource categories needed. For example, if Food is needed, suggest an allocation from the Food stock without exceeding the available stock.
          
          Output your response strictly in the following JSON format:
          {
            "allocations": [
              {
                "name": "Name of the resource (matching inventory)",
                "quantity": 100 // recommended quantity (integer, must be <= available stock in inventory)
              }
            ],
            "justification": "A brief explanation of how you computed these quantities (e.g. 'Staging 3 liters of water per affected person for 24h')."
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
          "Gemini Resource Advisor API failed, falling back to mock:",
          geminiError
        );
      }
    }

    // 2. Mock Fallback AI Allocator
    // Artificial delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const allocations: { name: string; quantity: number }[] = [];
    const justificationParts: string[] = [];

    // Simple deterministic allocation ratios
    const getInventoryItem = (name: string) =>
      inventory.find(
        (i: ResourceItem) => i.name.toLowerCase() === name.toLowerCase()
      );

    if (foodNeeded) {
      const foodItem = getInventoryItem("Food");
      if (foodItem && foodItem.availableStock > 0) {
        // 2 rations per affected person
        const qty = Math.min(
          foodItem.availableStock,
          Math.max(50, peopleAffected * 2)
        );
        allocations.push({ name: "Food", quantity: qty });
        justificationParts.push(
          `Allocating ${qty} crates of food rations (approx. 2 rations per affected person).`
        );
      }
    }

    if (waterNeeded) {
      const waterItem = getInventoryItem("Water");
      if (waterItem && waterItem.availableStock > 0) {
        // 3 liters per affected person
        const qty = Math.min(
          waterItem.availableStock,
          Math.max(100, peopleAffected * 3)
        );
        allocations.push({ name: "Water", quantity: qty });
        justificationParts.push(
          `Staging ${qty} liters of drinking water (approx. 3L per affected person).`
        );
      }
    }

    if (medicalEmergency) {
      const medItem = getInventoryItem("Medicine");
      const teamItem = getInventoryItem("Medical Teams");

      if (medItem && medItem.availableStock > 0) {
        const qty = Math.min(
          medItem.availableStock,
          Math.max(5, Math.ceil(peopleAffected / 25))
        );
        allocations.push({ name: "Medicine", quantity: qty });
        justificationParts.push(
          `Staging ${qty} triage medical kits (1 kit per 25 affected individuals).`
        );
      }

      if (teamItem && teamItem.availableStock > 0) {
        const qty = Math.min(
          teamItem.availableStock,
          Math.max(1, Math.ceil(peopleAffected / 100))
        );
        allocations.push({ name: "Medical Teams", quantity: qty });
        justificationParts.push(
          `Deploying ${qty} active trauma medical teams.`
        );
      }
    }

    const cleanType = (incidentType || "").toLowerCase();
    if (cleanType.includes("flooding") || cleanType.includes("water")) {
      const boatItem = getInventoryItem("Boats");
      if (boatItem && boatItem.availableStock > 0) {
        const qty = Math.min(
          boatItem.availableStock,
          Math.max(1, Math.ceil(peopleAffected / 150))
        );
        allocations.push({ name: "Boats", quantity: qty });
        justificationParts.push(
          `Deploying ${qty} rescue boats for amphibious evacuations.`
        );
      }
    } else if (cleanType.includes("fire") || cleanType.includes("smoke")) {
      const vehItem = getInventoryItem("Vehicles");
      if (vehItem && vehItem.availableStock > 0) {
        const qty = Math.min(vehItem.availableStock, 2);
        allocations.push({ name: "Vehicles", quantity: qty });
        justificationParts.push(
          `Dispatching ${qty} pickup transport vehicles for perimeter safety operations.`
        );
      }
    }

    if (shelterNeeded) {
      const blanketItem = getInventoryItem("Blankets");
      if (blanketItem && blanketItem.availableStock > 0) {
        const qty = Math.min(
          blanketItem.availableStock,
          Math.max(10, Math.ceil(peopleAffected * 0.5))
        );
        allocations.push({ name: "Blankets", quantity: qty });
        justificationParts.push(
          `Allocating ${qty} thermal blankets for emergency shelters.`
        );
      }
    }

    return NextResponse.json({
      allocations,
      justification:
        justificationParts.join(" ") ||
        "No specific emergency resources requested in report criteria. Standby dispatch staged.",
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Internal Resource Advisor error.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
