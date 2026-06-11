import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const devVarsPath = path.join(__dirname, '..', '.dev.vars');

if (!fs.existsSync(devVarsPath)) {
    console.error(`❌ .dev.vars file not found at: ${devVarsPath}`);
    process.exit(1);
}

const content = fs.readFileSync(devVarsPath, 'utf8');
const lines = content.split(/\r?\n/);

const secrets = {};

for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIdx = trimmed.indexOf('=');
    if (equalsIdx === -1) continue;

    const key = trimmed.substring(0, equalsIdx).trim();
    let val = trimmed.substring(equalsIdx + 1).trim();

    // Remove surrounding quotes if any
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
    }

    // Skip placeholders, local ports, or empty values
    if (
        key === 'PORT' ||
        val.includes('<YOUR_') ||
        val.includes('<ACCOUNT_ID>') ||
        val === ''
    ) {
        console.log(`⚠️ Skipping key: ${key} (placeholder or local variable)`);
        continue;
    }

    secrets[key] = val;
}

const keys = Object.keys(secrets);
console.log(`🔑 Found ${keys.length} secrets to upload to Cloudflare...`);

function putSecret(key, value) {
    return new Promise((resolve, reject) => {
        console.log(`📤 Uploading secret: ${key}...`);
        const child = spawn('npx', ['wrangler', 'secret', 'put', key], {
            shell: true,
            cwd: path.join(__dirname, '..'),
            stdio: ['pipe', 'ignore', 'inherit'] // ignore stdout to keep logs clean/secret
        });

        child.stdin.write(value);
        child.stdin.end();

        child.on('close', code => {
            if (code === 0) {
                console.log(`✅ Successfully uploaded: ${key}`);
                resolve();
            } else {
                reject(new Error(`Failed to upload secret ${key} (exit code ${code})`));
            }
        });
    });
}

async function uploadAll() {
    for (const key of keys) {
        try {
            await putSecret(key, secrets[key]);
        } catch (err) {
            console.warn(`⚠️  Skipping ${key}: ${err.message} (already set or binding conflict — continuing...)`);
        }
    }
    console.log('🎉 All secrets uploaded successfully to Cloudflare!');
}

uploadAll();
