/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Handler,
  HandlerEvent,
  HandlerResponse,
} from "@netlify/functions";
import { twiml } from "twilio";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const { MessagingResponse } = twiml;

// --- Initialize Clients ---
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// --- Type Definitions ---
type Course = { name: string; units: number; score: number };
type ConversationState = {
  status: "IDLE" | "AWAITING_COURSE_COUNT" | "COLLECTING_COURSES";
  totalCourses?: number;
  coursesCollected?: Course[];
};

// --- Helper Functions ---
const getGradePoint = (score: number): number => {
  if (score >= 70) return 5.0;
  if (score >= 60) return 4.0;
  if (score >= 50) return 3.0;
  if (score >= 45) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
};

async function getAiSummary(
  courses: Course[],
  gpa: string
): Promise<string | null> {
  try {
    const prompt = `You are GPAi, a friendly academic advisor. A student's GPA is ${gpa}. Their courses are: ${JSON.stringify(
      courses
    )}. Write a brief, encouraging summary. Mention their highest-scoring course as a 'strong point'. If the GPA is below 4.0, suggest a target GPA for the next semester. If it's above 4.0, commend them. Keep it concise.`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI Summary Error:", error);
    return null;
  }
}

// --- Main Handler ---
export const handler: Handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  console.log("--- whatsappWebhook START ---");
  const params = new URLSearchParams(event.body || "");
  const incomingMsg = params.get("Body")?.toLowerCase().trim() || "";
  const from = params.get("From")!;
  const numMedia = parseInt(params.get("NumMedia") || "0", 10);
  const mediaUrl = params.get("MediaUrl0");

  const twimlResponse = new MessagingResponse();

  // --- Step 1: Get User from Database ---
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("phone_number", from)
    .single();

  if (!user) {
    // --- Unregistered User Flow ---
    if (incomingMsg.startsWith("register")) {
      await supabase.from("users").insert({ phone_number: from });
      twimlResponse.message(
        "✅ You're registered! Welcome to GPAi.\n\nTo start, send me a clear picture of your results or reply 'calculate' to enter them manually."
      );
    } else {
      twimlResponse.message(
        "Welcome to GPAi! Please reply with 'register' to create your free account."
      );
    }
  } else if (numMedia > 0 && mediaUrl) {
    // --- Registered User Sends an Image ---
    twimlResponse.message(
      "Got it! 📸 Analyzing your results sheet now... This might take a moment. 🔬"
    );
    const siteUrl = `https://${event.headers.host}`;
    const backgroundFunctionUrl = `${siteUrl}/netlify/functions/ocrProcessor-background`;

    console.log(`Invoking background function at: ${backgroundFunctionUrl}`);

    // Asynchronously invoke the background function without waiting.
    // We use a .then().catch() here instead of await so the function can return immediately.
    fetch(backgroundFunctionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaUrl, from, user }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error(
            `Background function invocation failed with status: ${response.status}`
          );
        } else {
          console.log("Successfully invoked background function.");
        }
      })
      .catch((err) =>
        console.error("FATAL: Error invoking background function fetch:", err)
      );
  } else {
    // --- Registered User Sends a Text Message ---
    // Check for an OCR confirmation first
    const ocrData = user.ocr_data as {
      status: string;
      courses: Course[];
    } | null;
    if (ocrData?.status === "AWAITING_OCR_CONFIRMATION") {
      if (incomingMsg === "yes") {
        const courses = ocrData.courses;
        let totalQualityPoints = 0,
          totalUnits = 0;
        courses.forEach((c) => {
          totalQualityPoints += getGradePoint(c.score) * c.units;
          totalUnits += c.units;
        });
        const finalGpa = (totalQualityPoints / totalUnits).toFixed(2);

        const { data: newSemester } = await supabase
          .from("semesters")
          .insert({
            user_id: user.id,
            name: `Semester (from Image) ${new Date().toLocaleDateString()}`,
            gpa: parseFloat(finalGpa),
          })
          .select()
          .single();
        if (newSemester) {
          const coursesToInsert = courses.map((c) => ({
            ...c,
            semester_id: newSemester.id,
          }));
          await supabase.from("courses").insert(coursesToInsert);
        }

        twimlResponse.message(
          `🎉 Perfect! Your results are saved. Your GPA from the image is: *${finalGpa}*`
        );
        const summary = await getAiSummary(courses, finalGpa);
        if (summary)
          twimlResponse.message(`🤖 *GPAi's Analysis:*\n\n${summary}`);
      } else {
        twimlResponse.message(
          "No problem. Let's start over. Send 'calculate' or send a new image."
        );
      }
      await supabase.from("users").update({ ocr_data: null }).eq("id", user.id);
    } else {
      // --- If no OCR, handle the normal text-based calculator using cookies ---
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

      if (currentState.status === "IDLE") {
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
            `Great! Let's get the details for your ${courseCount} courses.\n\nPlease send the details for Course 1 in this format:\n\n*Course Code, Units, Score*`
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
            let totalQualityPoints = 0,
              totalUnits = 0;
            updatedCourses.forEach((c) => {
              totalQualityPoints += getGradePoint(c.score) * c.units;
              totalUnits += c.units;
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
            if (summary)
              twimlResponse.message(`🤖 *GPAi's Analysis:*\n\n${summary}`);
            nextState = { status: "IDLE" };
          }
        } else {
          twimlResponse.message(
            `Hmm, that format doesn't look right. Please use:\n\n*Course Code, Units, Score*`
          );
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
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/xml" },
    body: twimlResponse.toString(),
  };
};
