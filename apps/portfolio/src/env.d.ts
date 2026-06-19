/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID: string;
  readonly SANITY_DATASET: string;
  readonly SANITY_API_VERSION: string;
  readonly FORMSPREE_KEY: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly SANITY_PROJECT_ID: string;
    readonly SANITY_DATASET: string;
    readonly SANITY_API_VERSION: string;
    readonly FORMSPREE_KEY: string;
  }
}
