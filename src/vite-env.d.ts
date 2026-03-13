/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_SCORE_API_BASE_URL?: string
}

type ImportMeta = {
  readonly env: ImportMetaEnv
}
