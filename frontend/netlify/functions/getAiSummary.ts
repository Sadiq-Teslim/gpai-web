import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import type { APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { courses, gpa } = JSON.parse(event.body ?? '{}');

    // This is the "magic" prompt we send to the AI
    const prompt = `
      You are GPAi, a friendly and encouraging academic advisor. 
      A student just calculated their GPA. Their GPA is ${gpa}. 
      Their courses and scores are: ${JSON.stringify(courses)}.
      Write a short, personalized, and encouraging summary of their performance in a single paragraph. 
      Mention their highest-scoring course by name as a 'strong point'.
      Keep the tone positive and motivating, like you're talking to a friend.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful and encouraging academic assistant named GPAi.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150, // Control the length and cost
    });

    const summary = response.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ summary }),
    };
  } catch (error) {
    console.error('AI Summary Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate AI summary.' }),
    };
  }
};