/** @type {import('next').NextConfig} */

// Netlify automatically provides the site's URL as process.env.URL during
// build. If NEXTAUTH_URL wasn't set manually in the dashboard (or was left
// blank), fill it in automatically so NextAuth never crashes on an empty URL.
if (!process.env.NEXTAUTH_URL && process.env.URL) {
  process.env.NEXTAUTH_URL = process.env.URL;
}

const nextConfig = {};

module.exports = nextConfig;
