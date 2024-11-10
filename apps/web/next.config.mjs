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
            {
                protocol: 'https',
                hostname: 'www.google.com',
                port: '',
                pathname: '/s2/favicons**',
            }
        ],
    },
};

export default nextConfig;