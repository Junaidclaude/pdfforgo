/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // /remove-background was renamed to /bg-remover — 301 so existing
      // bookmarks/backlinks/search rankings carry over instead of 404ing.
      {
        source: '/remove-background',
        destination: '/bg-remover',
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
