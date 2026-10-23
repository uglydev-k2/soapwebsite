/** @type {import('next').NextConfig} */

function supabaseStoragePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return {
      protocol: "https",
      hostname: new URL(url).hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
}

const supabasePattern = supabaseStoragePattern();

const nextConfig = {
  images: {
    // Product photos are served from Supabase Storage; bypass Vercel's image optimizer
    // (avoids quota limits and 402 errors on /_next/image).
    unoptimized: true,
    remotePatterns: [
      ...(supabasePattern ? [supabasePattern] : []),
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mvlusciouslather.com" }],
        destination: "https://www.mvlusciouslather.com/:path*",
        permanent: true,
      },
      {
        source: "/collections/all",
        destination: "/collections",
        permanent: true,
      },
      {
        source: "/collections/all/products/:handle",
        destination: "/products/:handle",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
