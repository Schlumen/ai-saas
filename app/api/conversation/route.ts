import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("API key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/*

For anyone getting the interface issue (openaiv4 had some changes):

import OpenAI from "openai" //we only need to import this from openai
const userMessage: OpenAI.Chat.ChatCompletionMessage = {

        role: "user",

        content: values.prompt

      }

For node.js, no need to import configuration, here also we only need to import OpenAI.
const openai = new OpenAI ({

    apiKey: process.env.OPENAI_API_KEY

})

        const response = await openai.chat.completions.create({

            model: "gpt-3.5-turbo",

            messages: [instructionMessage, ...messages],

        })

        return new NextResponse(JSON.stringify(response.choices[0].message))

*/
