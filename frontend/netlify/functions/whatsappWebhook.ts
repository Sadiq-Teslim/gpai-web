import type { Handler } from "@netlify/functions";
import { twiml } from "twilio";

const { MessagingResponse } = twiml;

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

export const handler: Handler = async (event) => {
  // Parse incoming message from Twilio
  const params = new URLSearchParams(event.body || "");
  const incomingMsg = params.get("Body")?.toLowerCase().trim() || "";
  const from = params.get("From");

  console.log(`Received message from ${from}: "${incomingMsg}"`);

  // --- Read the "memory" from the Twilio cookie ---
  const cookie = event.headers.cookie || "";
  const conversationCookie = cookie
    .split(";")
    .find((c) => c.trim().startsWith("conversation="));
  let currentState: ConversationState = { status: "IDLE" };

  if (conversationCookie) {
    try {
      // If a cookie exists, parse it to get our current state
      currentState = JSON.parse(
        decodeURIComponent(conversationCookie.split("=")[1])
      );
    } catch (e) {
      console.error("Failed to parse conversation cookie:", e);
      currentState = { status: "IDLE" }; // Reset if the cookie is malformed
    }
  }

  // Create a new TwiML response object
  const twimlResponse = new MessagingResponse();
  let nextState: ConversationState = { ...currentState }; // Start with the current state

  // --- Main Conversational Logic Machine ---
  if (currentState.status === "IDLE") {
    // If the conversation is new or has been reset
    if (
      incomingMsg.includes("calculate") ||
      incomingMsg.includes("gpa") ||
      incomingMsg.includes("start")
    ) {
      twimlResponse.message(
        "Welcome to GPAi! 🤖\n\nHow many courses would you like to calculate?"
      );
      nextState.status = "AWAITING_COURSE_COUNT";
    } else {
      twimlResponse.message(
        `Hi there! I'm the GPAi Bot.\nSend "calculate gpa" to get started.`
      );
      // The state remains 'IDLE'
    }
  } else if (currentState.status === "AWAITING_COURSE_COUNT") {
    // If we are waiting for the user to tell us the number of courses
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
      // The state remains 'AWAITING_COURSE_COUNT'
    }
  } else if (currentState.status === "COLLECTING_COURSES") {
    // If we are actively collecting course details
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
        // If there are more courses to collect
        twimlResponse.message(
          `✅ Got it! *${name}* added.\n\nPlease send the details for Course ${
            updatedCourses.length + 1
          }:\n\n*Course Code, Units, Score*`
        );
        // The state remains 'COLLECTING_COURSES'
      } else {
        // --- All courses collected, time to calculate! ---
        let totalQualityPoints = 0;
        let totalUnits = 0;
        for (const course of updatedCourses) {
          totalQualityPoints += getGradePoint(course.score) * course.units;
          totalUnits += course.units;
        }
        const finalGpa = (totalQualityPoints / totalUnits).toFixed(2);

        twimlResponse.message(
          `🎉 Calculation complete!\n\nYour GPA is: *${finalGpa}*\n\nSend "calculate gpa" to start over.`
        );
        nextState = { status: "IDLE" }; // Reset the conversation
      }
    } else {
      // If the user's format was incorrect
      twimlResponse.message(
        `Hmm, that format doesn't look right. Please use:\n\n*Course Code, Units, Score*\n(e.g., PHY 102, 2, 68)`
      );
      // The state remains 'COLLECTING_COURSES'
    }
  }

  // --- Save our "memory" (the nextState) to a cookie for the next message ---
  const responseCookie = `conversation=${encodeURIComponent(
    JSON.stringify(nextState)
  )}; Path=/; HttpOnly`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/xml",
      "Set-Cookie": responseCookie, // This sends the updated state back to Twilio
    },
    body: twimlResponse.toString(),
  };
};