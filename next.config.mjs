/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/auth-js/ },
    ];
    return config;
  },
}

export default nextConfig
