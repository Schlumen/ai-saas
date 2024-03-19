"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("cb4d81cd-5421-44c3-98b9-134aa54b8f04");
  }, []);

  return null;
};
