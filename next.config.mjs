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
    remotePatterns: [
      ...(supabasePattern ? [supabasePattern] : []),
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
    ],
  },
  async redirects() {
    return [
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
