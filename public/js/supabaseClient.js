
// Initialize Supabase Client
// NOTE: Make sure to include the Supabase JS SDK in your HTML before this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://fhbwaqvmcdzhwxwtlcwi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoYndhcXZtY2R6aHd4d3RsY3dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTI0NTcsImV4cCI6MjA4MDY4ODQ1N30.h_4bYPntU9xqRbi5cUmVdPbACmmEp7CA-0rHnJPpMuQ';   

if (typeof supabase === 'undefined') {
    console.error('Supabase SDK not loaded! converting to mock mode or failing.');
}

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files (global scope for vanilla JS)
window.supabaseClient = _supabase;
