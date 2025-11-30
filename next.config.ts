import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* On demande à Vercel d'ignorer les erreurs ESLint et TS pendant le build */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* Vos autres configs existantes si nécessaire */
};

export default nextConfig;