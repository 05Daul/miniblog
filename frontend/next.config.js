// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // 💡 source: 프론트엔드에서 요청하는 URL 패턴 ('/images/'로 시작하는 모든 것)
        source: '/images/:path*',

        destination: 'http://127.0.0.1:1000/blog/images/:path*',
      },
    ]
  },

  // 기타 Next.js 설정을 필요하다면 여기에 추가할 수 있습니다.
};

module.exports = nextConfig;