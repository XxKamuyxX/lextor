import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "alexjdantas.com" }],
        destination: "https://www.alexjdantas.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const noStore = [
      {
        key: "Cache-Control",
        value:
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
      },
      { key: "CDN-Cache-Control", value: "no-store" },
      { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
      { key: "Surrogate-Control", value: "no-store" },
      { key: "Pragma", value: "no-cache" },
      { key: "Expires", value: "0" },
    ];

    return [
      { source: "/", headers: noStore },
      { source: "/index.html", headers: noStore },
      { source: "/:path*", headers: noStore },
    ];
  },
};

export default nextConfig;
