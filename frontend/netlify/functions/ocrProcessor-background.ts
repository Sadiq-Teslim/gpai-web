import type { Handler } from "@netlify/functions";
import { Twilio } from "twilio";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageAnnotatorClient } from "@google-cloud/vision";

// --- Initialize ALL Clients ---
// If an environment variable is missing, this is where the function will likely crash on startup.
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const visionCredentialsJson = Buffer.from(
  process.env.GOOGLE_VISION_CREDENTIALS_BASE64!,
  "base64"
).toString("utf-8");
const visionCredentials = JSON.parse(visionCredentialsJson);
const visionClient = new ImageAnnotatorClient({
  credentials: visionCredentials,
});
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// --- Type Definitions ---
type Course = { name: string; units: number; score: number };

// --- Helper Function 1: Extract Text from Image (OCR) ---
async function extractTextFromImage(imageUrl: string): Promise<string | null> {
  try {
    const [result] = await visionClient.textDetection(imageUrl);
    return result.fullTextAnnotation?.text || null;
  } catch (error) {
    console.error("Google Cloud Vision Error:", error);
    return null;
  }
}

// --- Helper Function 2: Structure OCR Text with Gemini ---
async function structureTextToCourses(
  rawText: string
): Promise<Course[] | null> {
  try {
    const prompt = `You are a data extraction assistant. The following text was extracted from a student's result sheet. Identify every course, its credit units, and its score. Return the data as a clean JSON array of objects, where each object has "name", "units", and "score". The final output must only be the JSON array, with no extra text or markdown. Raw Text: "${rawText}"`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    // A more robust way to extract JSON from the AI's response, handling potential markdown code blocks
    const jsonStringMatch = result.response
      .text()
      .match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
    const jsonString = jsonStringMatch
      ? jsonStringMatch[1] || jsonStringMatch[2]
      : null;

    if (!jsonString) return null;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Data Structuring Error:", error);
    return null;
  }
}

// --- Main Background Handler ---
export const handler: Handler = async (event) => {
  // --- DEFENSIVE LOGGING AND CHECKS ---
  console.log("--- ocrProcessor-background handler INVOKED ---");

  const twilioSandboxNumber = "whatsapp:+14155238886"; // Your Twilio Sandbox Number

  try {
    // 1. Check for all required environment variables
    const requiredEnvVars = [
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "GOOGLE_GEMINI_API_KEY",
      "GOOGLE_VISION_CREDENTIALS_BASE64",
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
    ];

    let missingVar = false;
    for (const key of requiredEnvVars) {
      if (!process.env[key]) {
        console.error(`FATAL: Environment variable ${key} is missing!`);
        missingVar = true;
      }
    }
    if (missingVar) {
      return {
        statusCode: 500,
        body: `Server configuration error: Missing environment variables.`,
      };
    }
    console.log("All environment variables found. Proceeding...");

    // 2. Parse the incoming request body
    console.log("Parsing event body...");
    const { mediaUrl, from, user } = JSON.parse(event.body || "{}");

    if (!mediaUrl || !from || !user) {
      console.error(
        "Handler failed: Missing mediaUrl, from, or user in the request body."
      );
      return { statusCode: 400, body: "Missing required parameters." };
    }
    console.log(`Processing request for user: ${from}`);

    // 3. Start the OCR process
    console.log("Step 1/3: Extracting text from image with Google Vision...");
    const rawText = await extractTextFromImage(mediaUrl);
    if (!rawText) {
      console.log("Google Vision failed to extract text.");
      await twilioClient.messages.create({
        from: twilioSandboxNumber,
        to: from,
        body: "Sorry, I couldn't read the text from that image. Please try a clearer picture.",
      });
      return {
        statusCode: 200,
        body: "Error message sent: Could not read text.",
      };
    }
    console.log("Step 1/3: Text extracted successfully.");

    // 4. Structure the text with Gemini
    console.log("Step 2/3: Structuring text with Gemini...");
    const courses = await structureTextToCourses(rawText);
    if (!courses || courses.length === 0) {
      console.log("Gemini failed to structure courses from text.");
      await twilioClient.messages.create({
        from: twilioSandboxNumber,
        to: from,
        body: "I found text, but couldn't identify any courses. Try entering them manually by sending 'calculate'.",
      });
      return { statusCode: 200, body: "Error message sent: No courses found." };
    }
    console.log(
      `Step 2/3: Gemini structured ${courses.length} courses successfully.`
    );

    // 5. Update the database and send the confirmation message
    console.log(
      "Step 3/3: Updating Supabase and sending confirmation to user..."
    );
    const { error: updateError } = await supabase
      .from("users")
      .update({ ocr_data: { status: "AWAITING_OCR_CONFIRMATION", courses } })
      .eq("id", user.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      await twilioClient.messages.create({
        from: twilioSandboxNumber,
        to: from,
        body: "Sorry, I ran into a database error. Please try again.",
      });
      return { statusCode: 500, body: "Database update failed." };
    }

    let confirmationMessage =
      "Okay, here's what I found. Does this look correct?\n\n";
    courses.forEach((c) => {
      confirmationMessage += `- *${c.name}*, ${c.units} Units, Score: ${c.score}\n`;
    });
    confirmationMessage += "\nReply *yes* to calculate, or *no* to start over.";

    await twilioClient.messages.create({
      from: twilioSandboxNumber,
      to: from,
      body: confirmationMessage,
    });
    console.log("Step 3/3: Confirmation message sent successfully.");
    console.log("--- ocrProcessor-background handler FINISHED ---");

    return { statusCode: 200, body: "Processing complete." };
  } catch (error) {
    // This will catch any unexpected crash in the entire process.
    console.error("!!! TOP-LEVEL CATCH IN ocrProcessor-background !!!", error);

    // Try to notify the user, but this might also fail if Twilio keys are the issue.
    try {
      const fromNumber = JSON.parse(event.body || "{}").from;
      if (fromNumber) {
        await twilioClient.messages.create({
          from: twilioSandboxNumber,
          to: fromNumber,
          body: "Oh no! GPAi ran into a critical server error. The issue has been logged. Please try again later.",
        });
      }
    } catch (notificationError) {
      console.error(
        "Could not send error notification to user:",
        notificationError
      );
    }

    return { statusCode: 500, body: "A critical error occurred." };
  }
};
