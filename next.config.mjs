/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tukanghubimagesandocuments.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
