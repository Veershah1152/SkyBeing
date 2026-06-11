import mongoose from "mongoose/lib/index.js";

// ---------------------------------------------------------------------------
// Disable command buffering - queries throw immediately if not connected
// instead of hanging indefinitely (which kills CF Workers requests).
// ---------------------------------------------------------------------------
mongoose.set("bufferCommands", false);

// Register lifecycle listeners ONCE at module level (NOT inside connectDB).
// Placing them inside connectDB causes them to accumulate on every reconnect,
// leading to the EventEmitter memory leak that corrupts promise chains.
mongoose.connection.on("connected",    () => console.log("[DB] connected to", mongoose.connection.host));
mongoose.connection.on("disconnected", () => console.log("[DB] disconnected"));
mongoose.connection.on("error",        e  => console.error("[DB] error:", e.message));

let connectionStartedAt = 0;

const connectDB = async () => {
    const readyState = mongoose.connection.readyState;

    // 1 = connected
    if (readyState === 1) return;

    // 2 = connecting
    if (readyState === 2) {
        const elapsed = Date.now() - connectionStartedAt;
        if (elapsed < 8000) {
            console.log(`[DB] DB is connecting (elapsed: ${elapsed}ms). Awaiting existing promise...`);
            await mongoose.connection.asPromise();
            return;
        } else {
            console.log(`[DB] DB connection attempt hung (elapsed: ${elapsed}ms). Force closing...`);
            await mongoose.connection.close(true).catch(() => {});
        }
    }

    // 3 = disconnecting
    if (readyState === 3) {
        console.log("[DB] DB is disconnecting. Force closing...");
        await mongoose.connection.close(true).catch(() => {});
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI env var is not set");

    console.log("[DB] Starting fresh connection to MongoDB...");
    connectionStartedAt = Date.now();
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS:          8000,
        connectTimeoutMS:         8000,
        maxPoolSize:              1,     // single socket
        minPoolSize:              0,
        family:                   4,     // force IPv4
    });
};

const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        console.log("[DB] Disconnecting...");
        await mongoose.disconnect();
    }
};

export { connectDB, disconnectDB };
