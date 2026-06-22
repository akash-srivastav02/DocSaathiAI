# Deploy FormFixer Backend on Koyeb

This backend is ready to run on Koyeb using the existing `backend/Dockerfile`.

## Before you deploy

Keep these ready:

- MongoDB connection string
- Cloudinary credentials
- Google OAuth client ID
- Razorpay live keys
- Frontend domain: `https://formfixer.in`

## Koyeb service setup

Create one web service with:

- Source: GitHub repository
- Branch: your production branch
- Builder: `Dockerfile`
- Dockerfile path: `backend/Dockerfile`
- Working directory: `backend`
- Exposed HTTP port: `5000`
- Health check path: `/healthz`

## Environment variables

Copy all keys from `backend/.env.example`.

Required values:

- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `GOOGLE_CLIENT_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Recommended defaults:

- `NODE_ENV=production`
- `PORT=5000`
- `GHOSTSCRIPT_PATH=/usr/bin/gs`

## Domain mapping

After the service is live, point `api.formfixer.in` to the Koyeb service.

Then keep the frontend API base URL on:

`https://api.formfixer.in/api`

## Smoke test

Check:

- `https://api.formfixer.in/`
- `https://api.formfixer.in/healthz`

Expected result:

- `/` returns backend version JSON
- `/healthz` returns `ok: true`

## Notes

- The Docker image already installs Ghostscript, so stronger PDF compression can work.
- Payment routes fail safely with `503` if Razorpay env vars are missing.
- Google auth should have `GOOGLE_CLIENT_ID` set before testing sign in.
