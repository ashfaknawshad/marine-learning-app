// supabase/functions/quiz-generator/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Updated prompt for the Gemini API
const QUIZ_PROMPT = `
  You are an expert AI assistant for a marine biology student creating a "Guess the Specimen" quiz.
  Based on the provided learning content (Department, Module, and Notes), your task is to:
  1. Identify the primary specimen or subject described in the notes. This will be the correct answer.
  2. Generate three scientifically plausible but incorrect distractor options. These should be related to the correct answer (e.g., other species from the same genus, family, or geographical area).
  3. Your response must be ONLY a valid JSON object with two keys: "correct_answer" and "options". The "options" array must contain all four choices (the correct answer and the three distractors) in a random order.
  Do not include the word 'json' or any markdown backticks in your response.

  Here is the learning content:
`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { log } = await req.json();
    if (!log || !log.text || !log.module) {
      throw new Error('Required log data (text, module) was not provided.');
    }

    // Combine the log data into a single context string for the AI
    const context = `
      Department: ${log.department.name}
      Module: ${log.module.name}
      Notes: ${log.text}
    `;

    // Gemini API endpoint and key
    const API_KEY = Deno.env.get('GEMINI_API_KEY');
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    
    // Structure the request body for the Gemini API
    const requestBody = {
      contents: [{
        parts: [{
          text: QUIZ_PROMPT + context
        }]
      }],
      generationConfig: {
        response_mime_type: "application/json", // Instruct Gemini to output JSON
        temperature: 0.6,
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
    const quizData = JSON.parse(aiResponseText);

    return new Response(JSON.stringify({ quiz: quizData }), {
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