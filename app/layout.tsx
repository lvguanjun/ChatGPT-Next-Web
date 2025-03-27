/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerSideConfig } from "./config/server";
import { McpInitializer } from "./components/mcp-initializer";
const serverConfig = getServerSideConfig();

// 添加字体优化
const fontStyleOptimization = `
  @font-face {
    font-family: 'Noto Sans';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: local(-apple-system), local(BlinkMacSystemFont);
  }
`;

export const metadata: Metadata = {
  title: "NeatChat",
  description: "Your personal ChatGPT Chat Bot.",
  appleWebApp: {
    title: "NeatChat",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/neat.svg" type="image/svg+xml" />
        <link
          rel="manifest"
          href="/site.webmanifest"
          crossOrigin="use-credentials"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
        <style dangerouslySetInnerHTML={{ __html: fontStyleOptimization }} />
        <style>
          {`
            html {
              text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
            }
          `}
        </style>
      </head>
      <body suppressHydrationWarning={true}>
        <McpInitializer />
        {children}
        {serverConfig?.isVercel && (
          <>
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
