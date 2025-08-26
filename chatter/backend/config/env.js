import "dotenv/config.js"

export const ENV={
    PORT:process.env.PORT,
    MONGO_DB_URI:process.env.MONGO_DB_URI,
    MONGODB_DB_NAME:process.env.MONGODB_DB_NAME,
    CLERK_PUBLISHABLE_KEY:process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY:process.env.CLERK_SECRET_KEY,
    STREAM_API_KEY:process.env.STREAM_API_KEY,
    STREAM_API_SECRET:process.env.STREAM_API_SECRET,
    SENTRY_DSN:process.env.SENTRY_DSN,
    INGEST_EVENT_KEY:process.env.INGEST_EVENT_KEY,
    INVEST_SIGNING_KEY:process.env.INVEST_SIGNING_KEY,
    NODE_ENV:process.env.NODE_ENV,
}