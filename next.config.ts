/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  }
};

module.exports = nextConfig;

