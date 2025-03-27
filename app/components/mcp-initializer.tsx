"use client";

import { useEffect } from "react";
import { useChatStore } from "../store/chat";

export function McpInitializer() {
  useEffect(() => {
    useChatStore.getState().initMcp();
  }, []);

  return null; // 这个组件不渲染任何内容
}
