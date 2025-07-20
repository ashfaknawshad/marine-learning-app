// supabase/functions/flashcard-generator/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// This is the prompt we will send to OpenAI
const FLASHCARD_PROMPT = `
  You are an expert AI assistant for a marine science student.
  Based on the following learning content, generate a concise set of 3 to 5 flashcards in a valid JSON array format.
  Each object in the array must have a "question" and an "answer" field.
  The questions should be clear and designed to test key concepts from the text.
  The answers should be direct and informative. Do not add any extra text, just return the JSON array.

  Here is the learning content:
`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Extract the learning text from the request body
    const { text } = await req.json()
    if (!text) {
      throw new Error('No text provided.')
    }

    // 2. Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // This model is fast and perfect for this task
        messages: [
          { role: 'system', content: FLASHCARD_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.5, // Controls creativity. Lower is more predictable.
        response_format: { type: "json_object" }, // Ensures the output is valid JSON
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorBody}`)
    }

    const data = await response.json();
    // The AI's response is a stringified JSON, so we parse it.
    const flashcards = JSON.parse(data.choices[0].message.content);

    // 3. Return the generated flashcards
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