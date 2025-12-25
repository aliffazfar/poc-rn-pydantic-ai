# JomKira - React Native AI Banking POC

> **Status:** POC Complete  
> **Note:** This is a Proof of Concept exploring React Native capabilities. Not production-ready.

A custom AI-powered banking assistant built with React Native and PydanticAI. Originally started as a [CopilotKit POC on Next.js](https://github.com/aliffazfar/poc-copilotkit-fastapi-pydantic-ai), which made me wonder if I could build it from scratch in React Native. Turns out I ended up having fun exploring Reanimated v4, RN Skia, Uniwind, FlashList v2, and more along the way.

<table>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/58b00c51-8f1e-414c-96fa-2e924ca42d2e" width="100%" alt="Bill Payment Demo">
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/04eb233f-92c8-454c-a83e-785b057f243b" width="100%" alt="Transfer Demo">
    </td>
  </tr>
</table>

## Libraries Explored

- **React Native 0.83 + React 19** – New architecture with React Compiler (no `useMemo`/`useCallback` needed)
- **Reanimated v4** – 60fps animations for chat drawer and header transitions
- **RN Skia** – GPU-accelerated mesh gradients via `@shopify/react-native-skia`
- **FlashList v2** – Fast list rendering for chat messages
- **Uniwind** – Tailwind CSS 4 for React Native
- **Bottom Sheet v5** – Gesture-driven sheet from `@gorhom/bottom-sheet`

## Features

- Custom chat interface with PydanticAI backend
- Generative UI – renders interactive Transfer Cards and Bill Payment Summaries in chat
- Vision-powered bill analysis from receipt images
- Backend guardrails middleware for input sanitization

## Tech Stack

| Layer | Stack |
|-------|-------|
| Mobile | React Native 0.83, React 19, Reanimated 4, RN Skia, FlashList, Uniwind |
| Backend | FastAPI, PydanticAI, Pydantic v2, Python 3.12 |

## Quick Start

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Setup environment**
   
   Copy `.env.example` to `.env` and configure your LLM provider:
   ```bash
   cp .env.example .env
   ```

3. **Setup Python agent**
   ```bash
   yarn setup:agent
   ```

4. **Run development**
   ```bash
   yarn dev
   ```
   Runs both FastAPI backend and Metro bundler.

5. **Launch app**
   ```bash
   yarn ios      # iOS Simulator
   yarn android  # Android Emulator
   ```

## Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Run backend + mobile concurrently |
| `yarn dev:agent` | Run Python agent only |
| `yarn dev:mobile` | Run Metro bundler only |
| `yarn ios` | Build & run on iOS |
| `yarn android` | Build & run on Android |
| `yarn ios:pods:reset` | Clean & reinstall CocoaPods |
