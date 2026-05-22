# Fit 'N' Blaze - Complete Deployment Guide

This guide will walk you through deploying your gym management system step-by-step in plain, easy-to-understand language. We will cover replacing your test Razorpay keys with live ones, uploading your code to Vercel for hosting, and connecting your custom domain using Namecheap.

---

## Step 1: Prepare Your Supabase Database
Your database needs to be fully set up before going live.
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard/).
2. On the left menu, click on the **SQL Editor**.
3. Make sure you have run the following files in the SQL Editor to create your tables and security rules:
   * `database/schema.sql` (Creates all tables)
   * `database/seed.sql` (Adds your default plans and Admin user)
   * `database/policies.sql` (Sets up the security rules we fixed)
4. Ensure your `js/supabase-client.js` file has your actual Supabase URL and Anon Key. (You have likely already done this during development).

---

## Step 2: Get Your Live Razorpay Keys
To accept real payments from clients, you need to switch from "Test Mode" to "Live Mode" in Razorpay.
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Look at the top right corner of the dashboard. If it says **Test Mode**, click the toggle to switch it to **Live Mode**. 
   *(Note: You must complete the Razorpay KYC verification process to enable Live Mode).*
3. On the left sidebar menu, go to **Account & Settings** -> **API Keys**.
4. Click **Generate Live Key**. 
5. A popup will show you your **Key Id** and **Key Secret**. Copy the **Key Id**. 
   *(You only need the Key Id for this frontend integration. Keep the Secret safe, but we don't need it for this step).*

---

## Step 3: Update Your Code with the Live Key
Now we need to tell your code to use the real payment gateway.
1. Open your code editor (like VS Code).
2. Open the file located at: `js/member.js`.
3. Scroll down to around **Line 840**. You are looking for the `initiateRazorpayPayment` function which has the Razorpay configuration.
4. It will currently look like this:
   ```javascript
   const options = {
       "key": "YOUR_RAZORPAY_LIVE_KEY_ID_HERE", // Live Key
       "amount": Math.round(plan.price * 100),
   ```
5. Note: Make sure to place your Live Key Secret in your `.env` file and keep it secure:
   ```
   RZP_LIVE_KEY=YOUR_RAZORPAY_LIVE_KEY_ID_HERE
   RZP_LIVE_SECRET=YOUR_RAZORPAY_LIVE_KEY_SECRET_HERE
   ```
6. Save the `member.js` file.

---

## Step 4: Upload Your Code to GitHub
Vercel needs to read your code from somewhere on the internet to host it. The best way is using GitHub.
1. Create a free account on [GitHub](https://github.com/).
2. The easiest way to upload your folder is to use GitHub Desktop. Download and install [GitHub Desktop](https://desktop.github.com/).
3. Log in to GitHub Desktop with your GitHub account.
4. Go to **File > Add Local Repository** and select your `fit n blaze` folder.
5. In the bottom left corner, type a summary like "Initial commit" and click **Commit to main**.
6. Finally, click **Publish repository** to push your code up to your GitHub account. Keep the code Private if you don't want others to see it.

---

## Step 5: Deploy the Website to Vercel
Vercel will take your code from GitHub and put it live on the internet.
1. Go to [Vercel](https://vercel.com/) and create a free account. **Sign up using your GitHub account.**
2. On your Vercel Dashboard, click the black **Add New...** button and select **Project**.
3. Under "Import Git Repository", you should see your `fit n blaze` repository. Click the **Import** button next to it.
4. A configuration screen will appear. You don't need to change anything! Just leave the Framework Preset as "Other" and the Root Directory as "./".
5. Click the big **Deploy** button.
6. Wait about 30 seconds. Vercel will build your site and give you a congratulations screen with a temporary `.vercel.app` link. 
7. Click the link to make sure your website is live and working on the internet!

---

## Step 6: Connect Your Namecheap Domain
Now let's replace that temporary Vercel link with the professional domain you bought on Namecheap.

**First, on Vercel:**
1. Go to your new project's dashboard on Vercel.
2. Click on the **Settings** tab in the top menu.
3. Click on **Domains** in the left sidebar menu.
4. Type in the domain you bought from Namecheap (for example: `yourgymname.com`) and click **Add**.
5. Vercel will now show you an error saying "Invalid Configuration". That's okay! It will give you a table of **DNS Records** to add. Usually, it's an `A Record` (numbers like `76.76.21.21`) and a `CNAME Record` (`cname.vercel-dns.com`). Keep this Vercel page open.

**Next, on Namecheap:**
1. Open a new tab, log in to your Namecheap account, and go to your **Domain List**.
2. Click the **Manage** button next to your domain.
3. Click on the **Advanced DNS** tab at the top.
4. In the **Host Records** section, you are going to click **Add New Record** to enter the info Vercel gave you:
   * **Add the A Record:** Select `A Record` from the dropdown. In the *Host* field, type `@`. In the *Value* field, paste the IP address Vercel gave you (usually `76.76.21.21`). Click the small green checkmark to save it.
   * **Add the CNAME Record:** Select `CNAME Record` from the dropdown. In the *Host* field, type `www`. In the *Value* field, paste the Vercel URL (usually `cname.vercel-dns.com.`). Click the green checkmark to save it.
5. **Very Important:** If there are any old, default records in that list (like a "URL Redirect Record" or an old "CNAME"), delete them using the trash can icon. You only want the ones you just added for Vercel.

**Final Step:**
Go back to your Vercel tab. It can take anywhere from 5 minutes to an hour for the internet to process the Namecheap changes (this is called DNS Propagation). 

Once it's done, Vercel will automatically turn green, issue a free SSL certificate (to make your site "https" secure), and your gym software will officially be live on your custom domain!
