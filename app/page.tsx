"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { useChatStore } from "./store/chat";

import { Home } from "./components/home";

import { getServerSideConfig } from "./config/server";

import { useServerCustomModels } from "./components/settings";

const serverConfig = getServerSideConfig();

export default function App() {

  useServerCustomModels();
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
