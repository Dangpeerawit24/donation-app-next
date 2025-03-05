/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        TZ: "Asia/Bangkok",
    },
    images: {
        domains: [
            'localhost',
        ],
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "",
                pathname: "/**",
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '3mb',
        },
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
