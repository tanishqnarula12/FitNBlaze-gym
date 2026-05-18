// supabase.js - Supabase Initialization
// NOTE: Make sure to include the Supabase CDN script in your HTML before loading this file.
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT URL AND ANON KEY
const SUPABASE_URL = 'https://culjftdtuiblsptgscgt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bGpmdGR0dWlibHNwdGdzY2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MDk1MDQsImV4cCI6MjA5NDQ4NTUwNH0.59SCXe7Fo25cdC1rjEglq5mqbwtzy7KJD_14WNA2GUA';

let supabaseClient = null;

// Initialize Supabase if the library is loaded
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase initialized successfully.");
} else {
    console.error("Supabase CDN script is missing. Please add it to your HTML file.");
}

// Export the client for use in other files (if using modules), 
// otherwise it's attached to window globally because this isn't a module.
window.db = supabaseClient;
