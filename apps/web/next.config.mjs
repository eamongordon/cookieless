/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'purecatamphetamine.github.io',
                port: '',
                pathname: '/country-flag-icons/**',
            },
        ],
    },
};

export default nextConfig;