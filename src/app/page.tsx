"use client";

import React from "react";
import dynamic from "next/dynamic";

const RTroulette = dynamic(() => import("@/app/_components/RTroulette"), {
  ssr: false,
});

export default function App() {
  return (
    <>
      <RTroulette />
    </>
  );
}
