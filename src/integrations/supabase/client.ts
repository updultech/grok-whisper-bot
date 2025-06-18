
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')
console.log('All env vars:', import.meta.env)

// Create a fallback client that will show meaningful errors
let supabase: any = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client created successfully')
  } else {
    console.warn('Supabase environment variables not found. Creating fallback client.')
    // Create a mock client that will provide helpful error messages
    supabase = {
      functions: {
        invoke: () => {
          return Promise.reject(new Error('Supabase connection not configured. Please ensure your Supabase integration is properly set up.'))
        }
      }
    }
  }
} catch (error) {
  console.error('Error creating Supabase client:', error)
  // Create fallback client even if there's an error
  supabase = {
    functions: {
      invoke: () => {
        return Promise.reject(new Error('Supabase connection not configured. Please ensure your Supabase integration is properly set up.'))
      }
    }
  }
}

export { supabase }
