import { createClient } from '@supabase/supabase-js';

// Safely retrieve environment variables handling potentially missing import.meta.env
const getEnvVar = (key: string) => {
  let value = '';
  
  // Try import.meta.env (Vite)
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && metaEnv[key]) {
      value = metaEnv[key];
    }
  } catch (e) {
    // Ignore
  }
  
  // Try process.env (Node/Webpack)
  if (!value) {
    try {
      if (typeof process !== 'undefined' && process.env && process.env[key]) {
        value = process.env[key] || '';
      }
    } catch (e) {
      // Ignore
    }
  }

  // Try window.process (Legacy/Shim)
  if (!value && typeof window !== 'undefined') {
    value = (window as any).process?.env?.[key] || '';
  }

  // Trim whitespace (fixes issues with .env files having spaces like "KEY= value")
  return value ? value.trim() : '';
};

// Default values provided for immediate connectivity if env vars fail to load
const DEFAULT_URL = 'https://sefuxvdhfgylmlqdrhoh.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZnV4dmRoZmd5bG1scWRyaG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMDIxNDMsImV4cCI6MjA4Mjg3ODE0M30.byEYXYtPrOCW52uwe-_k2wQe0fxNN8Y5nHgbBO4gciU';

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || DEFAULT_URL;
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://missing-env-var.supabase.co') {
  // We log an error but don't throw immediately to allow the app to render a friendly error UI if needed,
  // though createClient will likely fail if we pass empty strings.
  console.error('Supabase URL or Key is missing. Please check your .env.local file.');
}

// Initialize Supabase Client
export const supabase = createClient(
  supabaseUrl, 
  supabaseKey
);