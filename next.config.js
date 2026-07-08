/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // SharedArrayBuffer (required by @ffmpeg/core) is only available on
      // cross-origin isolated pages. Scope headers to merge-video only so the
      // rest of the site is not affected by COEP restrictions.
      {
        source: '/edit-video',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      {
        source: '/merge-video',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
      // The WASM files served from /ffmpeg/ must declare they can be loaded
      // by a COEP page (require-corp blocks resources without this header).
      {
        source: '/ffmpeg/:file*',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // /remove-background was renamed to /bg-remover — 301 so existing
      // bookmarks/backlinks/search rankings carry over instead of 404ing.
      {
        source: '/remove-background',
        destination: '/bg-remover',
        permanent: true,
      },
      {
        source: '/merge-video',
        destination: '/edit-video',
        permanent: true,
      },
    ]
  },

  experimental: {
    // Don't bundle native server-side packages — they contain .node binaries
    serverComponentsExternalPackages: [
      '@imgly/background-removal-node',
      'onnxruntime-node',
      'sharp',
    ],
  },

  webpack: (config) => {
    config.resolve.alias.canvas = false

    // onnxruntime-web .mjs files use import.meta.url to locate WASM files.
    // With javascript/auto (CJS mode), webpack replaces import.meta.url with a
    // URL object, causing "url.replace is not a function" at runtime.
    // javascript/esm keeps import.meta.url as a proper string.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules[/\\]onnxruntime-web/,
      type: 'javascript/esm',
    })
    // .js files in onnxruntime-web use CJS, keep auto-detect + fullySpecified off
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules[/\\]onnxruntime-web/,
      type: 'javascript/auto',
      resolve: { fullySpecified: false },
    })

    return config
  },
}

module.exports = nextConfig
