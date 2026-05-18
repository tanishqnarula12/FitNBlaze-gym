# Fit 'N' Blaze — Supabase Backend Setup Guide

This guide will walk you through setting up the complete database architecture for the Fit 'N' Blaze Gym Management System using Supabase's Free Plan.

---

## Step 1: Create a Supabase Project
1. Go to [Supabase.com](https://supabase.com/) and sign up / log in.
2. Click **"New Project"**.
3. Choose an organization, name the project `FitNBlaze_Backend`, and set a strong database password.
4. Select a region closest to your users (e.g., Mumbai, India).
5. Click **Create New Project**. (It takes 2-3 minutes to provision).

---

## Step 2: Get Your API Credentials
Once your project is ready:
1. Go to **Project Settings** (the gear icon on the left sidebar).
2. Click on **API** under the Configuration section.
3. You will see your **Project URL** and your **anon / public** key.
4. Open the `js/supabase.js` file in your project folder.
5. Replace the placeholder constants with your actual credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUz...';
   ```

---

## Step 3: Run the Database SQL Scripts
We have organized the database setup into modular SQL files. You will run these in the Supabase SQL Editor.

1. Go to the **SQL Editor** in your Supabase dashboard (the terminal icon on the left sidebar).
2. Click **"New query"**.

### Order of Execution:

**1. Run Schema Creation**
*   Open `database/schema.sql` in your code editor.
*   Copy all the text.
*   Paste it into the Supabase SQL Editor and click **Run**.
*   *This creates all tables (users, members, plans, etc.) and establishes foreign key relationships.*

**2. Run Custom Functions**
*   Clear the SQL editor.
*   Open `database/functions.sql`, copy all text, paste, and **Run**.
*   *This creates the auto-ID generation, the custom login function, and dashboard stats logic.*

**3. Run Seed Data**
*   Clear the SQL editor.
*   Open `database/seed.sql`, copy all text, paste, and **Run**.
*   *This inserts the default membership plans and the super admin account (`ADMIN001`).*

**4. (Optional) Run Policies**
*   If you want to enable Row-Level Security, review and run `database/policies.sql`.
*   *For this MVP, it is perfectly fine to leave RLS disabled since we are using custom PL/pgSQL auth logic.*

---

## Step 4: Include Scripts in your HTML
To connect your frontend to the database, you must include three things in the `<head>` or at the end of the `<body>` of your HTML files (especially `/auth/login.html`):

```html
<!-- 1. Supabase JS SDK (CDN) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 2. Your Supabase Init File -->
<script src="../js/supabase.js"></script>

<!-- 3. Your Auth Logic -->
<script src="../js/auth.js"></script>
```

---

## Step 5: Test the Login System
Now that the database is seeded and your credentials are in place:
1. Open your project's `/auth/login.html` page in your browser.
2. Select the **Admin** role tab.
3. Enter the default credentials:
   *   **Login ID**: `ADMIN001`
   *   **Phone Number**: `9876543210`
4. If successful, `auth.js` will save the session in your LocalStorage and redirect you to the Admin Dashboard!

---

## Next Steps for Development
*   **Connecting Admin Forms**: Open `js/admin-forms.js`. Inside the `btnSubmitMember.addEventListener` block, replace the `setTimeout` mock API call with a real `window.db.from('members').insert(...)` Supabase query.
*   **Public Enrollment**: In `js/join.js`, after a successful Razorpay payment, make a query to insert the new user and member record into Supabase instead of just showing the PDF.

Welcome to the backend of Fit 'N' Blaze! 🔥
