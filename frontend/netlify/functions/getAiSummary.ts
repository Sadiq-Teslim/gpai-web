/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { courses, gpa } = JSON.parse(event.body);

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


    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ summary }),
    };
  } catch (error) {
    console.error('Gemini AI Summary Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate AI summary.' }),
    };
  }
};