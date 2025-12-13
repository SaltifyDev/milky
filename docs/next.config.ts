import type { NextConfig } from 'next';
import nextra from 'nextra';

const withNextra = nextra({
  whiteListTagsStyling: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'code', 'pre'],
});

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default withNextra(nextConfig);
