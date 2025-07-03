<div align="center">

![](https://raw.githubusercontent.com/tianzhentech/static/main/images/NeatChat-Dark.svg)

![Stars](https://img.shields.io/github/stars/tianzhentech/neatchat)
![Forks](https://img.shields.io/github/forks/tianzhentech/neatchat)
![Web](https://img.shields.io/badge/Web-PWA-orange?logo=microsoftedge)
![Web](https://img.shields.io/badge/-Windows-blue?logo=windows)
![Release Badge](https://img.shields.io/github/v/release/tianzhentech/neatchat.svg)
![License](https://img.shields.io/github/license/tianzhentech/neatchat.svg)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tianzhentech/NeatChat.git)



简体中文 | [English](README.en.md)

Built on a deep refactoring of NextChat: A more elegant and powerful AI conversation solution
</div>

## ✨ 新特性

🎨 **UI Revamp**

✨ Fully adapted to the Lobe-UI design system, with refined interaction details
🌿 Cleaner interface layout for an immersive, distraction-free chat experience

🔌 **Plugin Ecosystem Expansion**

🧩 Natively compatible with official plugin protocols, seamlessly integrating with the NextChat plugin ecosystem
📦 Pre-installed plugins for drawing, calculations, search, and more, ready to use without configuration

📱 **Smooth Interaction Across Devices**

🔄 Deeply optimized for mobile touch controls with fluid gesture operations
📲 Responsive layout intelligently adapts to phones, tablets, and desktops for a natural experience everywhere

🌀 **Visualized Thought Chains**

🧠 Supports collapsible thought chains and progressive thinking process display
🎭 High-visualization interactions designed for complex reasoning scenarios

⚡ **Instant Setup Experience**

🚀 Automatically fetches model lists from server/client APIs
📦 Smart categorization & quick filtering to start your first conversation in 3 seconds

⚙️ **Flexible Configuration**

🔗 Redesigned `CUSTOM_MODELS` variable logic for seamless server-to-client configuration
🌐 Local-first principle while fully compatible with web user configurations

🧪 **Smart Model Prober**

✅ Unique multi-protocol testing solution for one-click proxy channel availability check
🔋 Supports server/client dual-mode health checks for clear stability insights

🖼️ **Model Avatar Workshop**

🎨 Localized avatar matching rule engine with support for regex deep customization
🔄 Automatically syncs with the official model library, ensuring new models are never "headless"

🚧 **Coming Soon**

🌉 Native multi-channel load balancing (no need to deploy OneAPI/NewAPI)
🏆 Building an All-in-One smart conversation hub, redefining productivity boundaries

## 🖼️ Interface Preview

![](https://raw.githubusercontent.com/tianzhentech/static/main/images/%7B326DD837-A2FE-4603-A289-47FD5FED329A%7D.png)
![](https://raw.githubusercontent.com/tianzhentech/static/main/images/%7B1FB6B249-72D5-42F0-B861-7FE95ADCEEEE%7D.png)
![](https://raw.githubusercontent.com/tianzhentech/static/main/images/%7B6656232E-09F3-472D-A2B4-621DDD57D9CC%7D.png)

![](https://raw.githubusercontent.com/tianzhentech/static/main/images/20250312232933.png)

![](https://raw.githubusercontent.com/tianzhentech/static/main/images/20250312223248.png)

![](https://raw.githubusercontent.com/tianzhentech/static/main/images/20250313011331.png)

> For more details, visit the [Demo Site](https://nc.tianz.me)

## ⚡ Quick Start

I have redefined the variables after `@` in `CUSTOM_MODELS`. For example, previously you could use `gpt-4o@OpenAI`, where `OpenAI` served as the provider and constrained the request format to OpenAI. However, as more models adopt the OpenAI format as the standard, using `@openai` became awkward and caused issues. Now, in my version, I recommend using `@model_category` to constrain the model. (The original method is still supported, but the `@` usage has been expanded.)

> You don’t need to do this manually; the client automatically handles the configuration. I simply recommend setting the variable on the server side with `@model_category`. Future updates will focus on this category.

All categories:

| Category      | Matching Rule         | Category    | Matching Rule       |
| ------------- | --------------------- | ----------- | ------------------- |
| Claude        | `claude`             | DALL-E      | `dall`             |
| DeepSeek      | `deepseek`           | Grok        | `grok`             |
| Gemini        | `gemini`             | MoonShot    | `moonshot\|kimi`   |
| WenXin        | `wenxin\|ernie`      | DouBao      | `doubao`           |
| HunYuan       | `hunyuan`            | Cohere      | `command`          |
| GLM           | `glm`                | Llama       | `llama`            |
| Qwen          | `qwen\|qwq\|qvq`     | ChatGPT     | `gpt\|o1\|o3`      |
| Mistral       | `mistral`            | Yi          | `yi`               |
| SenseNova     | `sensenova\|sense`   | Spark       | `spark`            |
| MiniMax       | `minimax\|abab`      | HaiLuo      | `hailuo`           |
| Gemma         | `gemma`              | StepFun     | `stepfun`          |
| Ollama        | `ollama`             | ComfyUI     | `comfyui`          |
| VolcEngine    | `volcengine`         | VertexAI    | `vertexai`         |
| SiliconCloud  | `siliconcloud`       | Perplexity  | `perplexity`       |
| Stability     | `stability`          | Flux        | `flux`             |

1. One-click deployment with Vercel: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tianzhentech/NeatChat.git)

2. For Docker, simply replace the official **yidadaa/chatgpt-next-web:version** with **tianzhentech/chatgpt-next-web:latest**

> Other configurations remain consistent with the official version. For detailed usage, refer to [NextChat](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)

## 🚢 Version Notes

| Type          | Status | Label Rules                     | Stability | Lifecycle          | Original Branch Replacement |
| ------------- | ------ | ------------------------------- | --------- | ------------------ | -------------------------- |
| **Pre-release** | 🔄 Active | Same version as stable, with pre-release tag | ⚠️ Testing | Frequent commits   | Replaces original preview branch |
| **Stable Release** | ✅ Stable | `vX.Y.Z`                         | ✔️ Production | Born from pre-release stability | Merges features from original mini branch |
| preview branch | 🚫 Deprecated | -                                | -          | Merged into main branch | Features handled by pre-release |
| mini branch    | 🚫 Deprecated | -                                | -          | Features integrated into stable version | No longer maintained independently |

## 💝 Sponsorship Support

This project does not seek sponsorship. However, if possible, you can support me with some SiliconFlow or VolcEngine credits. This will help me better support related models and potentially open a public station for those in need. Welcome to sponsor.

| Platform     | Direct Link                                            |
| ------------ | ----------------------------------------------------- |
| ✅ SiliconFlow | [Register Here](https://cloud.siliconflow.cn/i/tX3hT0Ly) |
| 🚀 VolcEngine | [Visit Now](https://volcengine.com/L/i5QyNFSX)         |


[![image](https://raw.githubusercontent.com/tianzhentech/static/main/images/20250409181441.png)](https://yxvm.com/)

[NodeSupport](https://github.com/NodeSeekDev/NodeSupport) sponsors this project



<a>

 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=tianzhentech/NeatChat&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=tianzhentech/NeatChat&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=tianzhentech/NeatChat&type=Date" />
 </picture>

</a>
