import type { Handler } from "@netlify/functions";
import { Twilio } from "twilio";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageAnnotatorClient } from "@google-cloud/vision";

// --- Initialize ALL Clients ---
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

type Course = { name: string; units: number; score: number };

// --- Helper Functions ---
async function extractTextFromImage(imageUrl: string): Promise<string | null> {
  try {
    const [result] = await visionClient.textDetection(imageUrl);
    return result.fullTextAnnotation?.text || null;
  } catch (error) {
    console.error("Google Cloud Vision Error:", error);
    return null;
  }
}

async function structureTextToCourses(
  rawText: string
): Promise<Course[] | null> {
  try {
    const prompt = `You are a data extraction assistant. The following text was extracted from a student's result sheet. Identify every course, its credit units, and its score. Return the data as a clean JSON array of objects, where each object has "name", "units", and "score". The final output must only be the JSON array, with no extra text or markdown. Raw Text: "${rawText}"`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
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
  console.log("--- ocrProcessor-background START ---");
  const { mediaUrl, from, user } = JSON.parse(event.body || "{}");
  if (!mediaUrl || !from || !user) {
    return { statusCode: 400, body: "Missing required parameters." };
  }

  const twilioSandboxNumber = "whatsapp:+14155238886"; // Your Twilio number

  const rawText = await extractTextFromImage(mediaUrl);
  if (!rawText) {
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

  const courses = await structureTextToCourses(rawText);
  if (!courses || courses.length === 0) {
    await twilioClient.messages.create({
      from: twilioSandboxNumber,
      to: from,
      body: "I found text, but couldn't identify any courses. Try entering them manually by sending 'calculate'.",
    });
    return { statusCode: 200, body: "Error message sent: No courses found." };
  }

  // Store the extracted courses in Supabase with a status, so the main webhook knows what to do next.
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

  // Send the confirmation message to the user, asking for 'yes' or 'no'.
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

  return { statusCode: 200, body: "Confirmation message sent." };
};
