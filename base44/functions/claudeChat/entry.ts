import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { messages, system } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: system || "You are a helpful assistant for LBA Directory, a local business directory.",
      messages: messages,
    });

    return Response.json({
      content: response.content[0].text,
      usage: response.usage,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});