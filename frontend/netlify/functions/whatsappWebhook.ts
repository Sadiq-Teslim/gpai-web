import type { Handler } from '@netlify/functions';
import { twiml } from 'twilio';

// The TwiML (Twilio Markup Language) is used for creating replies
const { MessagingResponse } = twiml;

export const handler: Handler = async (event) => {
  // Twilio sends data in a URL-encoded format, so we need to parse it.
  const params = new URLSearchParams(event.body || '');
  
  // Extract the message text and the sender's phone number.
  const incomingMsg = params.get('Body');
  const from = params.get('From');

  // Log the incoming message to your Netlify function logs for debugging.
  console.log(`Received message from ${from}: "${incomingMsg}"`);

  // Create a new TwiML response object.
  const twimlResponse = new MessagingResponse();

  // Add a message to the response.
  twimlResponse.message(`Hello from your GPAi Bot! 👋\n\nYou said: "${incomingMsg}"`);

  // Return the response to Twilio.
  // The response needs to be XML, which `twiml.toString()` handles for you.
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/xml',
    },
    body: twimlResponse.toString(),
  };
};