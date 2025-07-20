// supabase/functions/flashcard-generator/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Updated prompt for the Gemini API
const FLASHCARD_PROMPT = `
  You are an expert AI assistant for a marine science student.
  Based on the provided learning content, generate a comprehensive set of flashcards. The number of flashcards should be proportional to the content's length and detail.
  Your response must be ONLY a valid JSON array of objects.
  Each object must have a "question" and an "answer" field.
  Do not include the word 'json' or any markdown backticks in your response.

  Here is the learning content:
`
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json();
    if (!text) {
      throw new Error('No text provided.');
    }
    
    // Gemini API endpoint and key
    const API_KEY = Deno.env.get('GEMINI_API_KEY');
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // Structure the request body for the Gemini API
    const requestBody = {
      contents: [{
        parts: [{
          text: FLASHCARD_PROMPT + text
        }]
      }],
      generationConfig: {
        response_mime_type: "application/json", // Instruct Gemini to output JSON
        temperature: 0.5,
      }
    };

    // Make the API call to Google
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();

    // Extract and parse the response text from Gemini's structure
    const aiResponseText = data.candidates[0].content.parts[0].text;
    const flashcards = JSON.parse(aiResponseText);

    return new Response(JSON.stringify({ flashcards }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});