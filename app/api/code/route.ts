import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import {
  increaseApiLimit,
  checkApiLimit,
  increaseSubscriptionApiLimit,
  checkSubscriptionApiLimit,
} from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: ChatCompletionMessageParam = {
  role: "system",
  content:
    "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
};

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

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    if (isPro) {
      const apiLimitOk = await checkSubscriptionApiLimit("text");

      if (!apiLimitOk) {
        return new NextResponse("API limit exceeded", { status: 429 });
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [instructionMessage, ...messages],
    });

    if (isPro) {
      await increaseSubscriptionApiLimit("text");
    } else {
      await increaseApiLimit();
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error: any) {
    console.log("[CODE ERROR]", error);
    return new NextResponse("Internal error", {
      status: 500,
    });
  }
}
