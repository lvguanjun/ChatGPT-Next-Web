// @ts-ignore - 如果类型声明文件已存在，可以移除此行
import { encodingForModel } from "js-tiktoken";

// 初始化编码器
const enc = encodingForModel("gpt-3.5-turbo");

/**
 * 使用tiktoken准确计算LLM模型的token数量
 */
export function estimateTokenLengthInLLM(input: string): number {
  try {
    return enc.encode(input).length;
  } catch (e) {
    console.error("tiktoken编码失败，回退到估算方法", e);
    return Math.ceil(estimateTokenLength(input));
  }
}

/**
 * 基于字符特性估算token长度（不使用tiktoken）
 * 保留原有的estimateTokenLength实现
 */
export function estimateTokenLength(input: string): number {
  let tokenLength = 0;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    if (charCode < 128) {
      // ASCII character
      if (charCode <= 122 && charCode >= 65) {
        // a-Z
        tokenLength += 0.25;
      } else {
        tokenLength += 0.5;
      }
    } else {
      // Unicode character
      tokenLength += 1.5;
    }
  }

  return tokenLength;
}

/**
 * 编码文本为token数组
 */
export function encode(text: string): number[] {
  try {
    // 使用tiktoken编码器
    return enc.encode(text);
  } catch (e) {
    console.error("使用tiktoken编码失败，回退到估算方法", e);
    // 回退到估算方法
    const estimatedLength = Math.ceil(estimateTokenLength(text));
    return new Array(estimatedLength).fill(0);
  }
}

/**
 * 解码token数组为文本
 */
export function decode(tokens: number[]): string {
  try {
    return enc.decode(tokens);
  } catch (e) {
    console.error("解码失败", e);
    return "[解码失败]";
  }
}
