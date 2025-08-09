/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Handler, HandlerResponse } from "@netlify/functions"; // FIX: Import HandlerResponse
import { twiml } from "twilio";
import { createClient } from "@supabase/supabase-js";

const { MessagingResponse } = twiml;

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// --- GPA Calculation Logic ---
const getGradePoint = (score: number): number => {
  if (score >= 70) return 5.0;
  if (score >= 60) return 4.0;
  if (score >= 50) return 3.0;
  if (score >= 45) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
};

// --- Type definitions for our conversation's "memory" ---
type Course = { name: string; units: number; score: number };

type ConversationState = {
  status: "IDLE" | "AWAITING_COURSE_COUNT" | "COLLECTING_COURSES";
  totalCourses?: number;
  coursesCollected?: Course[];
};

export const handler: Handler = async (event): Promise<HandlerResponse> => {
  // FIX: Simplified the handler type back to just Handler
  const params = new URLSearchParams(event.body || "");
  const incomingMsg = params.get("Body")?.toLowerCase().trim() || "";
  const from = params.get("From")!; // The user's WhatsApp phone number

  const twimlResponse = new MessagingResponse();

  // --- 1. Check if the user is registered in our database ---
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("phone_number", from)
    .single();

  if (!user) {
    // --- 2. User is NOT registered ---
    if (incomingMsg.startsWith("register")) {
      // User wants to register, create their account
      await supabase.from("users").insert({ phone_number: from });
      twimlResponse.message(
        "✅ You're registered! GPAi uses cookies to keep record of our conversation data. Welcome to GPAi.\n\nYou can now start calculating your GPA. Send 'calculate' or 'gpa' to begin."
      );
    } else {
      // Guide the new user to register
      twimlResponse.message(
        "Welcome to GPAi! It looks like you're new here.\n\nPlease reply with 'register' to create a free account and start tracking your GPA."
      );
    }

    // FIX: Return the response for unregistered users here.
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: twimlResponse.toString(),
    };
  } else {
    // --- 3. User IS registered, proceed with the calculator logic ---
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
        currentState = { status: "IDLE" }; // Reset on error
      }
    }

    let nextState: ConversationState = { ...currentState };

    if (currentState.status === "IDLE") {
      if (incomingMsg.includes("calculate") || incomingMsg.includes("gpa")) {
        twimlResponse.message(
          "Welcome back! How many courses would you like to calculate for this semester?"
        );
        nextState.status = "AWAITING_COURSE_COUNT";
      } else {
        twimlResponse.message(`Hi there! Send "calculate gpa" to get started.`);
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
        twimlResponse.message("Please enter a valid number. How many courses?");
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
          // --- Calculation and Database Saving ---
          let totalQualityPoints = 0;
          let totalUnits = 0;
          for (const course of updatedCourses) {
            totalQualityPoints += getGradePoint(course.score) * course.units;
            totalUnits += course.units;
          }
          const finalGpa = (totalQualityPoints / totalUnits).toFixed(2);

          // Create a new semester entry
          const { data: newSemester } = await supabase
            .from("semesters")
            .insert({
              user_id: user.id,
              name: `Semester ${new Date().toLocaleString()}`,
              gpa: parseFloat(finalGpa),
            })
            .select()
            .single();

          if (newSemester) {
            // Add the semester_id to each course and save them
            const coursesToInsert = updatedCourses.map((c) => ({
              ...c,
              semester_id: newSemester.id,
            }));
            await supabase.from("courses").insert(coursesToInsert);
          }

          twimlResponse.message(
            `🎉 Calculation complete and results saved!\n\nYour GPA for this semester is: *${finalGpa}*\n\nSend "calculate gpa" to start a new one.`
          );
          nextState = { status: "IDLE" }; // Reset conversation
        }
      } else {
        twimlResponse.message(
          `Hmm, that format doesn't look right. Please use:\n\n*Course Code, Units, Score*\n(e.g., PHY 102, 2, 68)`
        );
      }
    }

    const responseCookie = `conversation=${encodeURIComponent(
      JSON.stringify(nextState)
    )}; Path=/; HttpOnly`;

    // Return the response for the registered user
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/xml",
        "Set-Cookie": responseCookie,
      },
      body: twimlResponse.toString(),
    };
  }
};
