/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Handler,
  HandlerEvent,
  HandlerResponse,
} from "@netlify/functions";
import { twiml } from "twilio";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageAnnotatorClient } from "@google-cloud/vision"; // <-- NEW: Import for OCR

const { MessagingResponse } = twiml;

// --- Initialize ALL Clients ---
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
// --- NEW: Initialize Google Cloud Vision Client for OCR ---
const visionClient = new ImageAnnotatorClient({
  key: process.env.GOOGLE_VISION_API_KEY!,
});

// --- GPA Logic (Unchanged) ---
const getGradePoint = (score: number): number => {
  if (score >= 70) return 5.0;
  if (score >= 60) return 4.0;
  if (score >= 50) return 3.0;
  if (score >= 45) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
};

// --- Type Definitions (Updated for OCR) ---
type Course = { name: string; units: number; score: number };

type ConversationState = {
  status:
    | "IDLE"
    | "AWAITING_COURSE_COUNT"
    | "COLLECTING_COURSES"
    | "AWAITING_OCR_CONFIRMATION"; // <-- NEW: Added OCR status
  totalCourses?: number;
  coursesCollected?: Course[];
  ocrCourses?: Course[]; // <-- NEW: To store courses from image
};

// --- AI Helper Function 1: Get Performance Summary (Unchanged) ---
async function getAiSummary(
  courses: Course[],
  gpa: string
): Promise<string | null> {
  try {
    const prompt = `
      You are GPAi, a friendly and encouraging academic advisor. 
      A student just calculated their GPA. Their GPA is ${gpa}. 
      Their courses and scores are: ${JSON.stringify(courses)}.
      Write a summary of their performance and what you think they can do to improve. It is justa one-off advice, not a continous one so its not conversational. 
      Mention their highest-scoring course by name as a 'strong point'.
      Keep the tone positive and motivating, like you're talking to a friend. 
      Don't make it too long. It should be as brief as possible. 
      Also, suggest what GPA they can have the following semester to balance things up (that's if the GPA is low below 4.0). 
      If the GPA is already above 4.0, just mention that they're doing good.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI Summary Error:", error);
    return null;
  }
}

// --- NEW: AI Helper Function 2: Extract Text from Image (OCR) ---
async function extractTextFromImage(imageUrl: string): Promise<string | null> {
  try {
    const [result] = await visionClient.textDetection(imageUrl);
    return result.fullTextAnnotation?.text || null;
  } catch (error) {
    console.error("Google Cloud Vision Error:", error);
    return null;
  }
}

// --- NEW: AI Helper Function 3: Structure OCR Text with Gemini ---
async function structureTextToCourses(
  rawText: string
): Promise<Course[] | null> {
  try {
    const prompt = `You are a data extraction assistant. The following text was extracted from a student's result sheet. Identify every course, its credit units, and its score. Return the data as a clean JSON array of objects, where each object has "name", "units", and "score". The final output must only be the JSON array, with no extra text or markdown. Raw Text: "${rawText}"`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const jsonString = result.response.text().match(/\[[\s\S]*\]/)?.[0];
    if (!jsonString) return null;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Data Structuring Error:", error);
    return null;
  }
}

// --- Main Handler ---
export const handler: Handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  const params = new URLSearchParams(event.body || "");
  const incomingMsg = params.get("Body")?.toLowerCase().trim() || "";
  const from = params.get("From")!;
  const numMedia = parseInt(params.get("NumMedia") || "0", 10);
  const mediaUrl = params.get("MediaUrl0");

  const twimlResponse = new MessagingResponse();

  const cookie = event.headers.cookie || "";
  const conversationCookie = cookie
    .split(";")
    .find((c) => c.trim().startsWith("conversation="));
  let currentState: ConversationState = { status: "IDLE" };
  if (conversationCookie) {
    try {
      currentState = JSON.parse(
        decodeURIComponent(conversationCookie.split("=")[1])
      );
    } catch (e) {
      currentState = { status: "IDLE" };
    }
  }
  let nextState: ConversationState = { ...currentState };

  // --- Main Logic Branch: Image or Text? ---
  if (numMedia > 0 && mediaUrl) {
    // --- NEW: OCR FLOW ---
    twimlResponse.message(
      "Got it! 📸 Analyzing your results sheet now... This might take a moment. 🔬"
    );
    const rawText = await extractTextFromImage(mediaUrl);
    if (!rawText) {
      twimlResponse.message(
        "Sorry, I couldn't read the text from that image. Please try a clearer picture."
      );
      nextState = { status: "IDLE" };
    } else {
      const courses = await structureTextToCourses(rawText);
      if (!courses || courses.length === 0) {
        twimlResponse.message(
          "I found text, but couldn't identify any courses. Try entering them manually by sending 'calculate'."
        );
        nextState = { status: "IDLE" };
      } else {
        let confirmationMessage =
          "Okay, here's what I found. Does this look correct?\n\n";
        courses.forEach((c) => {
          confirmationMessage += `- *${c.name}*, ${c.units} Units, Score: ${c.score}\n`;
        });
        confirmationMessage +=
          "\nReply *yes* to calculate, or *no* to start over.";
        twimlResponse.message(confirmationMessage);
        nextState = {
          status: "AWAITING_OCR_CONFIRMATION",
          ocrCourses: courses,
        };
      }
    }
  } else {
    // --- TEXT-BASED FLOW (Your existing code) ---
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", from)
      .single();

    if (!user) {
      // Unregistered user logic...
      if (incomingMsg.startsWith("register")) {
        await supabase.from("users").insert({ phone_number: from });
        twimlResponse.message(
          "✅ You're registered! Welcome to GPAi.\n\nSend 'calculate' or 'gpa' to begin."
        );
      } else {
        twimlResponse.message(
          "Welcome to GPAi! Please reply with 'register' to create your free account."
        );
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/xml" },
        body: twimlResponse.toString(),
      };
    } else {
      // Registered User Conversation Logic...
      if (currentState.status === "AWAITING_OCR_CONFIRMATION") {
        // --- NEW: Handle the user's 'yes' or 'no' reply after OCR ---
        if (incomingMsg === "yes") {
          const courses = currentState.ocrCourses || [];
          let totalQualityPoints = 0,
            totalUnits = 0;
          courses.forEach((c) => {
            totalQualityPoints += getGradePoint(c.score) * c.units;
            totalUnits += c.units;
          });
          const finalGpa = (totalQualityPoints / totalUnits).toFixed(2);

          twimlResponse.message(
            `🎉 Perfect! Your GPA from the image is: *${finalGpa}*`
          );
          const summary = await getAiSummary(courses, finalGpa);
          if (summary)
            twimlResponse.message(`🤖 *GPAi's Analysis:*\n\n${summary}`);
          twimlResponse.message(
            `Send "calculate gpa" to start over, or send another image.`
          );

          nextState = { status: "IDLE" };
        } else {
          twimlResponse.message(
            "No problem. Let's start over. Send 'calculate' to enter courses manually."
          );
          nextState = { status: "IDLE" };
        }
      } else if (currentState.status === "IDLE") {
        if (incomingMsg.includes("calculate") || incomingMsg.includes("gpa")) {
          twimlResponse.message(
            "Welcome back! How many courses would you like to calculate?"
          );
          nextState.status = "AWAITING_COURSE_COUNT";
        } else {
          twimlResponse.message(
            `Hi there! Send "calculate gpa" to get started, or just send me a picture of your results.`
          );
        }
      } else if (currentState.status === "AWAITING_COURSE_COUNT") {
        const courseCount = parseInt(incomingMsg, 10);
        if (!isNaN(courseCount) && courseCount > 0) {
          twimlResponse.message(
            `Great! Let's get the details for your ${courseCount} courses.\n\nPlease send the details for Course 1 in this format:\n\n*Course Code, Units, Score*\n(e.g., MTH 101, 3, 85)`
          );
          nextState = {
            status: "COLLECTING_COURSES",
            totalCourses: courseCount,
            coursesCollected: [],
          };
        } else {
          twimlResponse.message(
            "Please enter a valid number. How many courses?"
          );
        }
      } else if (currentState.status === "COLLECTING_COURSES") {
        const parts = incomingMsg.split(",").map((p) => p.trim());
        const [name, unitsStr, scoreStr] = parts;
        const units = parseInt(unitsStr, 10);
        const score = parseInt(scoreStr, 10);

        if (
          parts.length === 3 &&
          name &&
          !isNaN(units) &&
          units > 0 &&
          !isNaN(score) &&
          score >= 0 &&
          score <= 100
        ) {
          const newCourse: Course = { name, units, score };
          const updatedCourses = [
            ...(currentState.coursesCollected || []),
            newCourse,
          ];
          nextState.coursesCollected = updatedCourses;
          const coursesRemaining =
            (currentState.totalCourses || 0) - updatedCourses.length;

          if (coursesRemaining > 0) {
            twimlResponse.message(
              `✅ Got it! *${name}* added.\n\nPlease send the details for Course ${
                updatedCourses.length + 1
              }:\n\n*Course Code, Units, Score*`
            );
          } else {
            let totalQualityPoints = 0;
            let totalUnits = 0;
            updatedCourses.forEach((course) => {
              totalQualityPoints += getGradePoint(course.score) * course.units;
              totalUnits += course.units;
            });
            const finalGpa = (totalQualityPoints / totalUnits).toFixed(2);

            const { data: newSemester } = await supabase
              .from("semesters")
              .insert({
                user_id: user.id,
                name: `Semester ${new Date().toLocaleDateString()}`,
                gpa: parseFloat(finalGpa),
              })
              .select()
              .single();
            if (newSemester) {
              const coursesToInsert = updatedCourses.map((c) => ({
                ...c,
                semester_id: newSemester.id,
              }));
              await supabase.from("courses").insert(coursesToInsert);
            }

            twimlResponse.message(
              `🎉 Calculation complete and results saved!\n\nYour GPA for this semester is: *${finalGpa}*`
            );
            const summary = await getAiSummary(updatedCourses, finalGpa);
            if (summary) {
              twimlResponse.message(`🤖 *GPAi's Analysis:*\n\n${summary}`);
            }
            twimlResponse.message(`Send "calculate gpa" to start a new one.`);
            nextState = { status: "IDLE" };
          }
        } else {
          twimlResponse.message(
            `Hmm, that format doesn't look right. Please use:\n\n*Course Code, Units, Score*`
          );
        }
      }
    }
  }

  const responseCookie = `conversation=${encodeURIComponent(
    JSON.stringify(nextState)
  )}; Path=/; HttpOnly`;
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/xml", "Set-Cookie": responseCookie },
    body: twimlResponse.toString(),
  };
};
