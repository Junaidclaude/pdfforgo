const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'node_modules', '@ffmpeg', 'core', 'dist')
const dst = path.join(__dirname, '..', 'public', 'ffmpeg')

if (!fs.existsSync(src)) {
  console.error('[copy-ffmpeg] ERROR: @ffmpeg/core not found at', src)
  console.error('[copy-ffmpeg] Make sure @ffmpeg/core is in dependencies (not devDependencies)')
  process.exit(1)
}

fs.mkdirSync(dst, { recursive: true })

for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js']) {
  const srcFile = path.join(src, file)
  if (!fs.existsSync(srcFile)) {
    console.error('[copy-ffmpeg] ERROR: Missing file:', srcFile)
    process.exit(1)
  }
  fs.copyFileSync(srcFile, path.join(dst, file))
  console.log('[copy-ffmpeg] Copied', file)
}

console.log('[copy-ffmpeg] Done — FFmpeg WASM ready in public/ffmpeg/')
