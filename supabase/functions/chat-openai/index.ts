import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROMPT_ID = "pmpt_68e1a38df6c88196ad95378637b453780eeb471199c1276b";
const PROMPT_VERSION = "2";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, previousResponseId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const requestBody: any = {
      model: "gpt-4o",
      prompt: { 
        id: PROMPT_ID, 
        version: PROMPT_VERSION 
      },
      input: [
        {
          role: "user",
          content: [{
            type: "input_text",
            text: message
          }]
        }
      ]
    };

    // Add previous_response_id if continuing conversation
    if (previousResponseId) {
      requestBody.previous_response_id = previousResponseId;
      console.log('Continuing conversation with response ID:', previousResponseId);
    }

    console.log('Calling OpenAI Responses API with prompt ID:', PROMPT_ID);
    
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Full OpenAI response:', JSON.stringify(data, null, 2));
    console.log('Response ID:', data.id);
    console.log('Output text:', data.output_text);
    console.log('Output:', data.output);

    // Handle different possible response formats
    const outputText = data.output_text || data.output?.[0]?.content || data.text || '';

    return new Response(
      JSON.stringify({
        responseId: data.id,
        outputText: outputText
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat-openai function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to get response from AI assistant' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
