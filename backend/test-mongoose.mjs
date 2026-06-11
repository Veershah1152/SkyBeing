import mongoose from "mongoose/lib/index.js";
const { Schema } = mongoose;
console.log("mongoose loaded successfully from lib/index.js!");
console.log("Schema exists:", !!Schema);
console.log("connect exists:", typeof mongoose.connect === "function");
process.exit(0);
