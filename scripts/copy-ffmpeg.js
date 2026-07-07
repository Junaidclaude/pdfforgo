const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'node_modules', '@ffmpeg', 'core', 'dist', 'umd')
const dst = path.join(__dirname, '..', 'public', 'ffmpeg')

fs.mkdirSync(dst, { recursive: true })

for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  fs.copyFileSync(path.join(src, file), path.join(dst, file))
  console.log(`[copy-ffmpeg] Copied ${file}`)
}
