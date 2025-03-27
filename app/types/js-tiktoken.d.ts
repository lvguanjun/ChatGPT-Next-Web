declare module "js-tiktoken" {
  export function encodingForModel(model: string): {
    encode(text: string): number[];
    decode(tokens: number[]): string;
  };
}
