/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false

    // Allow @imgly/background-removal's ONNX Runtime ESM bundles (use import.meta)
    // to be treated as native ESM rather than CommonJS so Terser doesn't break them.
    config.module.rules.push({
      test: /\.(m?)js$/,
      include: /node_modules[/\\]onnxruntime-web/,
      type: 'javascript/auto',
      resolve: { fullySpecified: false },
    })

    return config
  },
}

module.exports = nextConfig
