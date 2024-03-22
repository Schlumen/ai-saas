import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { API_LIMITS, MAX_FREE_COUNTS } from "@/constants";

export const increaseApiLimit = async () => {
  const { userId } = auth();

  if (!userId) return;

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: {
        userId,
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: {
        userId,
        count: 1,
      },
    });
  }
};

export const checkApiLimit = async () => {
  const { userId } = auth();

  if (!userId) return false;

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (!userApiLimit) return true;

  return userApiLimit.count < MAX_FREE_COUNTS;
};

export const getApiLimitCount = async () => {
  const { userId } = auth();

  if (!userId) return 0;

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (!userApiLimit) return 0;

  return userApiLimit.count;
};

type ApiType = "text" | "image" | "video" | "music";

export const increaseSubscriptionApiLimit = async (
  api: ApiType,
  increment = 1
) => {
  const { userId } = auth();

  if (!userId) return;

  const SubscriptionApiLimit = await prismadb.subscriptionApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (!SubscriptionApiLimit) return;

  await prismadb.subscriptionApiLimit.update({
    where: {
      userId,
    },
    data: {
      [`${api}Count`]: {
        increment,
      },
    },
  });
};

export const checkSubscriptionApiLimit = async (
  api: ApiType,
  plannedGenerations = 1
) => {
  const { userId } = auth();

  if (!userId) return false;

  const SubscriptionApiLimit = await prismadb.subscriptionApiLimit.findUnique({
    where: {
      userId,
    },
    select: {
      [`${api}Count`]: true,
    },
  });

  if (!SubscriptionApiLimit) return false;

  const count = SubscriptionApiLimit[`${api}Count`];
  const limits = API_LIMITS;

  return count + plannedGenerations <= limits[api];
};

export const getApiUsage = async () => {
  const { userId } = auth();

  if (!userId)
    return {
      textCount: 0,
      imageCount: 0,
      musicCount: 0,
      videoCount: 0,
    };

  const SubscriptionApiLimit = await prismadb.subscriptionApiLimit.findUnique({
    where: {
      userId,
    },
    select: {
      textCount: true,
      imageCount: true,
      musicCount: true,
      videoCount: true,
    },
  });

  if (!SubscriptionApiLimit)
    return {
      textCount: 0,
      imageCount: 0,
      musicCount: 0,
      videoCount: 0,
    };

  return SubscriptionApiLimit;
};
