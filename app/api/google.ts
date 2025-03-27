import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { getServerSideConfig } from "@/app/config/server";
import { ApiPath, GEMINI_BASE_URL, ModelProvider } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";

const serverConfig = getServerSideConfig();

// 添加 Gemini 图像生成模型的常量
const GEMINI_IMAGE_GENERATION_MODEL = "gemini-2.0-flash-exp";

export async function handle(
  req: NextRequest,
  { params }: { params: { provider: string; path: string[] } },
) {
  console.log("[Google Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const authResult = auth(req, ModelProvider.GeminiPro);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  const bearToken =
    req.headers.get("x-goog-api-key") || req.headers.get("Authorization") || "";
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();

  const apiKey = token ? token : serverConfig.googleApiKey;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: true,
        message: `missing GOOGLE_API_KEY in server env vars`,
      },
      {
        status: 401,
      },
    );
  }
  try {
    const response = await request(req, apiKey);
    return response;
  } catch (e) {
    console.error("[Google] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
export const preferredRegion = [
  "bom1",
  "cle1",
  "cpt1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];

async function request(req: NextRequest, apiKey: string) {
  const controller = new AbortController();

  let baseUrl = serverConfig.googleUrl || GEMINI_BASE_URL;

  let path = `${req.nextUrl.pathname}`.replaceAll(ApiPath.Google, "");

  // 检查是否为图像生成请求
  const isImageGenerationRequest = path.includes(GEMINI_IMAGE_GENERATION_MODEL);

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  console.log("[Proxy] ", path);
  console.log("[Base Url]", baseUrl);

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  // 构建请求 URL，处理图像生成的特殊参数
  let fetchUrl = `${baseUrl}${path}`;
  if (req?.nextUrl?.searchParams?.get("alt") === "sse") {
    fetchUrl += "?alt=sse";
  }

  console.log("[Fetch Url] ", fetchUrl);

  // 准备请求头
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "x-goog-api-key": apiKey,
  };

  // 如果请求头中有 x-goog-api-key 或 Authorization，使用它们
  if (req.headers.get("x-goog-api-key")) {
    headers["x-goog-api-key"] = req.headers.get("x-goog-api-key") || "";
  } else if (req.headers.get("Authorization")) {
    headers["x-goog-api-key"] = (
      req.headers.get("Authorization") || ""
    ).replace("Bearer ", "");
  }

  // 处理请求体，对于图像生成请求可能需要特殊处理
  let body: BodyInit | null = req.body;

  // 如果是图像生成请求，确保请求体包含正确的 responseModalities
  if (isImageGenerationRequest && req.body) {
    try {
      // 克隆请求以读取其内容
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text();
      const bodyJson = JSON.parse(bodyText);

      // 确保 generationConfig 包含 responseModalities
      if (!bodyJson.generationConfig) {
        bodyJson.generationConfig = {};
      }

      // 确保 responseModalities 包含 Image
      if (
        !bodyJson.generationConfig.responseModalities ||
        !bodyJson.generationConfig.responseModalities.includes("Image")
      ) {
        bodyJson.generationConfig.responseModalities = ["Text", "Image"];
      }

      // 创建新的请求体
      body = JSON.stringify(bodyJson);
    } catch (e) {
      console.error(
        "[Google Image Generation] Failed to process request body",
        e,
      );
    }
  }

  const fetchOptions: RequestInit = {
    headers,
    method: req.method,
    body,
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);
    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
