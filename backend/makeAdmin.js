import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB...");

        const email = "veershah1152@gmail.com";
        const user = await User.findOneAndUpdate(
            { email },
            { $set: { role: "admin" } },
            { new: true }
        );

        if (user) {
            console.log(`✅ Success! Updated user ${user.name} (${user.email}) to role: ${user.role}`);
        } else {
            console.log(`❌ User with email ${email} not found. Please ensure you have registered first.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error updating user:", error);
        process.exit(1);
    }
};

makeAdmin();
