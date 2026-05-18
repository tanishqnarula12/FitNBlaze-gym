// supabase.js - Supabase Initialization
// NOTE: Make sure to include the Supabase CDN script in your HTML before loading this file.
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT URL AND ANON KEY
const SUPABASE_URL = 'https://rbgbankeujppvtarycqe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZ2JhbmtldWpwcHZ0YXJ5Y3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTM3ODksImV4cCI6MjA5NDY2OTc4OX0._62oOAYpmpJZWN4P5mWxHvjqNL0TfpmBsp1ulwaSN2M';

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
