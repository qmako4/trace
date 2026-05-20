/// <reference types="expo/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_GOOGLE_AIR_QUALITY_KEY: string;
    EXPO_PUBLIC_R2_ACCOUNT_ID: string;
    EXPO_PUBLIC_R2_PUBLIC_URL: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
  }
}
