/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Handler } from '@netlify/functions';
import { twiml } from 'twilio';

const { MessagingResponse } = twiml;

export const handler: Handler = async (event) => {
  const twimlResponse = new MessagingResponse();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  let debugMessage = "Debugging GPAi Bot:\n\n";

  if (supabaseUrl) {
    debugMessage += "✅ SUPABASE_URL was found.\n";
  } else {
    debugMessage += "❌ ERROR: SUPABASE_URL is MISSING!\n";
  }

  if (supabaseKey) {
    debugMessage += "✅ SUPABASE_ANON_KEY was found.\n";
  } else {
    debugMessage += "❌ ERROR: SUPABASE_ANON_KEY is MISSING!\n";
  }
  
  // You can add more variables to test here if needed.

  twimlResponse.message(debugMessage);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: twimlResponse.toString(),
  };
};