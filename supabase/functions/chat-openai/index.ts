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

    // Extract assistant text from the first message-type output item
    let outputText = '';
    if (data.output && Array.isArray(data.output)) {
      const messageItem = data.output.find((item: any) => item?.type === 'message' && Array.isArray(item.content));
      if (messageItem) {
        const parts = messageItem.content as any[];
        const texts = parts
          .filter((p) => p && (p.type === 'output_text' || typeof p.text !== 'undefined'))
          .map((p) => {
            const t = p.text;
            if (typeof t === 'string') return t;
            if (t && typeof t.value === 'string') return t.value;
            return '';
          })
          .filter(Boolean);
        outputText = texts.join('\n').trim();
      }
    }

    // Fallback to output_text if provided directly by the API/SDK
    if (!outputText && typeof data.output_text === 'string') {
      outputText = data.output_text;
    }

    console.log('Extracted text:', outputText);

    return new Response(
      JSON.stringify({
        responseId: data.id,
        outputText
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
