import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

// Always start the server, even if DB connection fails
app.listen(process.env.PORT || 8000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
});

// Connect to DB separately
connectDB()
    .then(() => {
        console.log("✅ MONGODB connection SUCCESS");
    })
    .catch((err) => {
        console.error("❌ MONGO db connection failed:", err.message);
        console.error("   → Fix: Whitelist your IP on MongoDB Atlas Network Access");
    });
