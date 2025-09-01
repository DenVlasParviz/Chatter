# Chatter

Chat application on the MERN stack with Google authentication support (Clerk), asynchronous event processing (Inngest), integration with GetStream for chats and video calls, deployment on Vercel, and error monitoring via Sentry.

---

## Contents
- [Overview](#overview)
- [Requirements](#requirements)
- [Environment Variables (.env)](#environment-variables-env)
- [Local Installation and Running](#local-installation-and-running)
- [Screenshots](#screenshots)

---

## Overview
 **Chatter** implements the MERN stack (MongoDB, Express, React, Node.js) and includes:
- OAuth 2.0 via **Clerk**.
- **Inngest** for asynchronous event processing, sending user data to the database.
- **GetStream** for chat streams and video calls.
- **MongoDB** for storing user profiles.
- Backend deployment on **Vercel**.
- Error monitoring and logging via **Sentry**.

## Requirements
- Node.js >= 16
- npm or yarn
- MongoDB (local or Atlas)
- Accounts/keys: Clerk, GetStream, Inngest, Sentry
- Vercel 

## Environment Variables (.env)
Example `server/.env`:
```
PORT=5000
MONGO_DB_URI=mongo_db_uri
MONGODB_DB_NAME=mongodb_name
NODE_ENV=node_env
JWT_SECRET=your_jwt_secret
CLERK_PUBLISHABLE_KEY=clerk_api_key_here
CLERK_SECRET_KEY=clerk_jwt_key_here
STREAM_API_KEY=stream_api_key
STREAM_API_SECRET=stream_api_secret
INGEST_EVENT_KEY=inngest_api_key
INVEST_SIGNING_KEY=inngest_signing_key
SENTRY_DSN=https://example@sentry.io/12345
VERCEL_URL=https://your-project.vercel.app
```

## Local Installation and Running

- Install dependencies and run server and client in two separate terminals:
```bash
# server
cd server
npm install
npm run dev

# client
cd ../client
npm install
npm run dev
```

## Screenshots
<img width="1879" height="932" alt="RvRvpnGui_I2HiVACbwZ" src="https://github.com/user-attachments/assets/99e29851-47c9-4548-99d9-ef0846c8b01f" />
<img width="1855" height="924" alt="firefox_Dx5Y3SZzXx" src="https://github.com/user-attachments/assets/8434c1e7-0e60-4be9-b72a-94ef44900c1a" />
<img width="1553" height="920" alt="firefox_GJYYMLlyE7" src="https://github.com/user-attachments/assets/10bded07-a26d-4c6d-a64d-ca87d50c7e91" />
<img width="1912" height="907" alt="firefox_L0iD79xXlh" src="https://github.com/user-attachments/assets/4a93454b-7e92-429e-943f-3fd6aa118460" />
