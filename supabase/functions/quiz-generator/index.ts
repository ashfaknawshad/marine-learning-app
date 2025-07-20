// supabase/functions/quiz-generator/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// The AI prompt for generating the quiz
const QUIZ_PROMPT = `
  You are an expert AI assistant for a marine biology student creating a "Guess the Specimen" quiz.
  Based on the provided learning content, which includes the Department, Module, and the user's notes, your task is to:
  1. Identify the primary specimen or subject described in the notes. This will be the correct answer.
  2. Generate three scientifically plausible but incorrect distractor options. These should be related to the correct answer (e.g., other species from the same genus, family, or geographical area).
  3. Return a valid JSON object with two keys: "correct_answer" and "options". The "options" array must contain all four choices (the correct answer and the three distractors) in a random order.

  Here is the learning content:
`

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Extract the learning log data from the request
    const { log } = await req.json()
    if (!log || !log.text || !log.module) {
      throw new Error('Required log data (text, module) was not provided.')
    }

    // Combine the log data into a single context string for the AI
    const context = `
      Department: ${log.department.name}
      Module: ${log.module.name}
      Notes: ${log.text}
    `
    
    // 2. Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using a more advanced model for better accuracy
        messages: [
          { role: 'system', content: QUIZ_PROMPT },
          { role: 'user', content: context },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorBody}`)
    }

    const data = await response.json()
    // The AI's response is a stringified JSON, so we parse it.
    const quizData = JSON.parse(data.choices[0].message.content)

    // 3. Return the generated quiz data
    return new Response(JSON.stringify({ quiz: quizData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})