import express from "express";
import {ENV} from "../config/env.js"
import {connectDB} from "../config/db.js";
import {clerkMiddleware} from "@clerk/express";
import {serve} from "inngest/express"
import {inngest, functions} from "../config/inngest.js";
import chatRoute from "../routes/chatRoute.js";
import "../instrument.mjs"
import * as Sentry from "@sentry/node";
import cors from "cors"


const app = express();

app.use(clerkMiddleware()) //req.auth will be available in the req object
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));app.use(express.json())

app.get("/debug-sentry",(req,res)=>{
    throw new Error("Sentry Errr")
})

app.get("/", (req, res) => {
    res.send("index")
})

app.use("/api/inngest", serve({client: inngest, functions}));
app.use("/api/chat", chatRoute);

Sentry.setupExpressErrorHandler(app)

const startServer = async () => {
    try {
        await connectDB()
        if (ENV.NODE_ENV !== "production") {
            app.listen(ENV.PORT, () => {
                    console.log('server is on', ENV.PORT)
                    connectDB()
                }
            )
        }
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}
startServer();

export default app