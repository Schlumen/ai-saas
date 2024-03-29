import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: session?.metadata?.userId,
      },
    });

    if (userSubscription) {
      await prismadb.userSubscription.update({
        where: {
          userId: session?.metadata?.userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    } else {
      await prismadb.userSubscription.create({
        data: {
          userId: session?.metadata?.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }

    const SubscriptionApiLimit = await prismadb.subscriptionApiLimit.findUnique(
      {
        where: {
          userId: session?.metadata?.userId,
        },
      }
    );

    if (SubscriptionApiLimit) {
      await prismadb.subscriptionApiLimit.update({
        where: {
          userId: session?.metadata?.userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          textCount: 0,
          imageCount: 0,
          videoCount: 0,
          musicCount: 0,
        },
      });
    } else {
      await prismadb.subscriptionApiLimit.create({
        data: {
          userId: session?.metadata?.userId,
          stripeSubscriptionId: subscription.id,
          textCount: 0,
          imageCount: 0,
          videoCount: 0,
          musicCount: 0,
        },
      });
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (userSubscription) {
      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    }

    const SubscriptionApiLimit = await prismadb.subscriptionApiLimit.findUnique(
      {
        where: {
          stripeSubscriptionId: subscription.id,
        },
      }
    );

    if (SubscriptionApiLimit) {
      await prismadb.subscriptionApiLimit.update({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          textCount: 0,
          imageCount: 0,
          videoCount: 0,
          musicCount: 0,
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
