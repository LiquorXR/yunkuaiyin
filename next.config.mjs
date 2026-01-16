/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', // 改为根路径，因为 Express app.use('/', adminRouter)
      },
    ];
  },
};

export default nextConfig;
