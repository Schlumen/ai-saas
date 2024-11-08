import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

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

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = "1", resolution = "1024x1024" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("API key not configured", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }

    if (isPro) {
      const apiLimitOk = await checkSubscriptionApiLimit(
        "image",
        parseInt(amount)
      );

      if (!apiLimitOk) {
        return new NextResponse("API limit exceeded", { status: 429 });
      }
    }

    const promises = [];

    for (let i = 0; i < parseInt(amount); i++) {
      promises.push(
        openai.images.generate({
          model: "dall-e-3",
          prompt,
          size: resolution,
        })
      );
    }

    const responses = await Promise.all(promises);
    const data = responses.map(response => response.data);

    if (isPro) {
      await increaseSubscriptionApiLimit("image", parseInt(amount));
    } else {
      await increaseApiLimit();
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.log("[IMAGE ERROR]", error);
    return new NextResponse("Internal error", {
      status: 500,
    });
  }
}
