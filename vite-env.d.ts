/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    LLM_API_KEY: string | undefined;
    LLM_API_BASE: string | undefined;
    LLM_MODEL: string | undefined;
  }
}
