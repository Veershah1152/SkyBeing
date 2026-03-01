/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                skyGreen: "#0E7A0D", // Primary Green from screenshot
                skyBrown: "#6C4E3D", // Footer Brown from screenshot
                skyBg: "#F5F3F0",    // Light background variant
            }
        },
    },
    plugins: [],
}
