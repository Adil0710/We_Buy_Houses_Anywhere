/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "a0.muscache.com" },
      { hostname: "source.unsplash.com" },
      { hostname: "ap.rdcpix.com" },
      { hostname: "nh.rdcpix.com" },
    ],
  },
};

export default nextConfig;
