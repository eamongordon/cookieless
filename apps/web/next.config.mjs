import createMDX from '@next/mdx'

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
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']
};

const withMDX = createMDX({
    options: {
        remarkPlugins: [
            ['remark-frontmatter', { type: 'yaml', marker: '-' }],
            ['remark-mdx-frontmatter', { name: 'frontmatter' }]
        ],
    }
});

export default withMDX(nextConfig);