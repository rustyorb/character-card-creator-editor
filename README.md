# Character Card Utils Web

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

**Character Card Utils Web** is a powerful, AI-driven toolkit for creating, validating, and managing **V2 Character Cards** for roleplaying chatbots (e.g., SillyTavern, Agnaistic, etc.).

Built with React and Vite, it leverages Large Language Models (LLMs) to generate detailed character personalities, scenarios, and dialogue examples from simple prompts. It supports both Google's Gemini API and any OpenAI-compatible provider (Ollama, LM Studio, vLLM, etc.).

## 🚀 Features

### 🎨 AI Character Generator
- **Text-to-Card**: Generate complete, schema-compliant V2 character cards from a simple text description.
- **Field Regeneration**: Don't like a specific field (e.g., Personality or Scenario)? Regenerate just that part while keeping the rest consistent.
- **Import & Edit**: Upload existing JSON or PNG character cards to refine them.
- **Export**: Download your creations as strictly formatted JSON or embedded PNG character cards.

### 🛠️ Utilities
- **V2 Validator**: Check if a character card complies with the V2 specification.
- **V1 to V2 Updater**: Convert legacy V1 cards to the modern V2 format.
- **Backfiller**: Automatically fill in missing V2 fields for older cards using AI or heuristic logic.
- **Prompt Engineering**: Customize the system prompts used for generation and regeneration to fine-tune the AI's creative output.

### ⚙️ Flexible AI Configuration
- **Multi-Provider Support**: Use Google Gemini (default) or connect to any OpenAI-compatible endpoint (local or remote).
- **Customizable Prompts**: Edit the core instructions that drive character generation directly in the UI.

---

## 📋 Prerequisites

- **Node.js**: Version 18 or higher.
- **API Key**: A Google Gemini API key OR an API key/endpoint for an OpenAI-compatible provider.

---

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rustyorb/character-card-creator-editor.git
   cd character-card-creator-editor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. **Set up API Keys:**
   Open `.env` in your text editor and configure your LLM provider.

   **Option A: Google Gemini (Default)**
   ```env
   LLM_API_KEY=your_gemini_api_key_here
   # Leave LLM_API_BASE commented out
   ```

   **Option B: OpenAI-Compatible (e.g., Ollama, LocalAI, OpenAI)**
   ```env
   LLM_API_KEY=your_api_key_here
   LLM_API_BASE=http://localhost:11434/v1
   LLM_MODEL=llama3:latest
   ```

---

## 🖥️ Usage

### Development Server
Run the app locally with hot-reloading:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view it in the browser.

### Production Build
Build the application for deployment:
```bash
npm run build
```
The output will be in the `dist/` directory. You can preview the build using:
```bash
npm run preview
```

---

## 🧩 Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Context (Settings, Prompts)
- **AI Integration**: `@google/genai` SDK and custom fetch wrappers for OpenAI compatibility.
- **Card Logic**: `character-card-utils` (Core library for parsing/writing card formats).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
