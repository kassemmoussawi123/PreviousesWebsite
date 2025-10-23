# Drive to website folder

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/kassemmoussawi123s-projects/v0-drive-to-website-folder)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/i8pbZJbEueG)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/kassemmoussawi123s-projects/v0-drive-to-website-folder](https://vercel.com/kassemmoussawi123s-projects/v0-drive-to-website-folder)**

To trigger a fresh deployment from your local environment:

1. Install dependencies and produce a production build locally to verify everything works:
   ```bash
   pnpm install
   pnpm run build
   ```
2. Ensure the required environment variables (such as the Supabase keys and Google Drive credentials listed below) are present in your Vercel project settings under **Settings → Environment Variables**.
3. Push your changes to the `work` branch (or whichever branch is connected to Vercel). Vercel will automatically build and redeploy the application.
4. If you prefer using the Vercel CLI, log in with `pnpm dlx vercel login` and run `pnpm dlx vercel --prod` from the project root to publish the latest build.

> **Note:** This environment cannot perform the live deployment itself, so follow the steps above from your machine to refresh the hosted site and obtain the public URL.

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/i8pbZJbEueG](https://v0.app/chat/projects/i8pbZJbEueG)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Importing course materials from Google Drive

This project now includes a CLI utility that can synchronise a structured Google Drive folder with the Supabase database used by the site. The importer preserves folder context in the material metadata so that files remain organised after the migration.

### 1. Prepare a service account

1. Create a Google Cloud project (or reuse an existing one) and enable the **Google Drive API**.
2. Create a service account and download its JSON key.
3. Share the root Drive folder (or individual subfolders) with the service account email so it can read the files.

### 2. Set the required environment variables

Add the following entries to your environment (for example inside `.env.local` when running locally or in your deployment provider):

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_ROOT_FOLDER_ID="1p2TBoh1dOdq1ADjIZDWlsX-bebUfvW6_"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

> **Note:** keep the private key formatted as a single line string in environment variables. The import script automatically restores the line breaks.

### 3. Run the importer

With the environment variables in place, execute:

```bash
node scripts/import-google-drive.js
```

The script assumes the following Drive structure:

- The root folder contains one sub-folder per department (for example `Computer Science`, `Mathematics`, ...).
- Each department folder contains course folders named like `CMPS 200 - Introduction to Computer Science`.
- Any files or nested folders inside a course folder will be imported. Nested folders are used to infer the material type (exam, quiz, notes, etc.) and stored under `metadata.path` for later reference.

### 4. Manual uploads remain supported

The admin dashboard keeps the ability to add courses and upload individual files manually. Manually uploaded files are tagged with the `manual` source, whereas imported items receive the `google-drive` source label.
