import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // If this log appears, we have successfully called the function.
  console.log("--- ocrProcessor-background INVOKED (SIMPLE TEST) ---");
  
  // Let's also log what we received to make sure data is passing through.
  console.log("Received body:", event.body);
  console.log("Request headers:", event.headers);

  // We must return a valid response.
  return {
    statusCode: 200,
    body: "Hello from the simple background function!",
  };
};