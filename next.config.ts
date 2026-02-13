import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  
  // REQUIRED: Must match your repository name exactly
  basePath: '/hris-superadmin', 
  
  images: {
    unoptimized: true,
  },
};

export default nextConfig;