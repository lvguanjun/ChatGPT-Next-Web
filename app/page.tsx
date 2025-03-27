"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { useChatStore } from "./store/chat";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default function App() {
  useEffect(() => {
    useChatStore.getState().initMcp();
  }, []);

  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
          <Analytics />
        </>
      )}
    </>
  );
}
