export interface Tool {
  slug: string
  name: string
  description: string
  shortDesc: string
  category: 'organize' | 'optimize' | 'convert-to' | 'convert-from' | 'edit' | 'security' | 'image' | 'video' | 'social'
  iconColor: string
  iconBg: string
}

export const TOOLS: Tool[] = [
  // ── ORGANIZE PDF ────────────────────────────────────────
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document. Drag to reorder before merging.',
    shortDesc: 'Combine multiple PDFs into one',
    category: 'organize',
    iconColor: '#E84A4A',
    iconBg: '#FEF2F2',
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract specific pages or split your PDF into multiple separate files instantly.',
    shortDesc: 'Extract pages into separate files',
    category: 'organize',
    iconColor: '#F97316',
    iconBg: '#FFF7ED',
  },
  {
    slug: 'remove-pages',
    name: 'Remove Pages',
    description: 'Delete specific pages from your PDF. Preview thumbnails and select pages to remove.',
    shortDesc: 'Delete pages from a PDF',
    category: 'organize',
    iconColor: '#EF4444',
    iconBg: '#FEF2F2',
  },
  {
    slug: 'organize-pdf',
    name: 'Organize PDF',
    description: 'Drag and drop to reorder PDF pages. Delete unwanted pages and save the result.',
    shortDesc: 'Reorder and delete PDF pages',
    category: 'organize',
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
  },
  {
    slug: 'extract-pages',
    name: 'Extract Pages',
    description: 'Select specific pages to extract from your PDF. Save as a single document or download each page separately.',
    shortDesc: 'Extract selected pages from a PDF',
    category: 'organize',
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
  },

  // ── OPTIMIZE PDF ─────────────────────────────────────────
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce your PDF file size while maintaining quality. Perfect for email and uploads.',
    shortDesc: 'Reduce file size, keep quality',
    category: 'optimize',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
  },
  {
    slug: 'grayscale-pdf',
    name: 'Grayscale PDF',
    description: 'Convert a color PDF to black and white. Reduces file size by up to 60% — ideal for printing and archiving.',
    shortDesc: 'Convert color PDF to black & white',
    category: 'optimize',
    iconColor: '#6B7280',
    iconBg: '#F9FAFB',
  },
  {
    slug: 'repair-pdf',
    name: 'Repair PDF',
    description: 'Fix corrupted or damaged PDF files. Cleans invalid objects, malformed structure, and xref errors.',
    shortDesc: 'Fix corrupted PDF files',
    category: 'optimize',
    iconColor: '#F59E0B',
    iconBg: '#FFFBEB',
  },

  // ── CONVERT TO PDF ───────────────────────────────────────
  {
    slug: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Convert HTML files to PDF right in your browser. Fonts, colors, and layout are captured as a snapshot.',
    shortDesc: 'Convert HTML files to PDF',
    category: 'convert-to',
    iconColor: '#F97316',
    iconBg: '#FFF7ED',
  },
  {
    slug: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets (.xlsx, .xls, .csv) to PDF. Formatting, charts, and merged cells preserved.',
    shortDesc: 'Convert Excel spreadsheets to PDF',
    category: 'convert-to',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert one or multiple images (JPG, PNG, WebP) into a single PDF document.',
    shortDesc: 'Convert images to PDF',
    category: 'convert-to',
    iconColor: '#EC4899',
    iconBg: '#FDF2F8',
  },
  {
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents (.docx, .doc) to PDF while preserving formatting perfectly.',
    shortDesc: 'Convert Word to PDF',
    category: 'convert-to',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
  },

  // ── CONVERT FROM PDF ─────────────────────────────────────
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert each PDF page to a high-quality JPG image. Download all at once as a ZIP.',
    shortDesc: 'Convert PDF pages to JPG images',
    category: 'convert-from',
    iconColor: '#A855F7',
    iconBg: '#FAF5FF',
  },
  {
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    description: 'Convert PDF pages to lossless PNG images. Perfect for sharp text, diagrams, and screenshots.',
    shortDesc: 'Convert PDF pages to lossless PNG',
    category: 'convert-from',
    iconColor: '#14B8A6',
    iconBg: '#F0FDFA',
  },
  {
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert your PDF to an editable Word document (.docx) while preserving formatting.',
    shortDesc: 'Convert to editable DOCX',
    category: 'convert-from',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
  },
  {
    slug: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Extract text from scanned PDFs using OCR. Copy the text, download a .txt file, or get a searchable PDF.',
    shortDesc: 'Extract text from scanned PDFs',
    category: 'convert-from',
    iconColor: '#6366F1',
    iconBg: '#EEF2FF',
  },
  {
    slug: 'compare-pdf',
    name: 'Compare PDF',
    description: 'Compare two PDFs and see exactly what text was added, removed, or changed, page by page.',
    shortDesc: 'Find differences between two PDFs',
    category: 'convert-from',
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
  },

  // ── EDIT PDF ─────────────────────────────────────────────
  {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages by 90, 180, or 270 degrees. Rotate all pages or specific ones.',
    shortDesc: 'Rotate pages in your PDF',
    category: 'edit',
    iconColor: '#EAB308',
    iconBg: '#FEFCE8',
  },
  {
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    description: 'Add a custom text or image watermark to your PDF. Control opacity, position, and size.',
    shortDesc: 'Add text watermarks to PDF',
    category: 'edit',
    iconColor: '#06B6D4',
    iconBg: '#ECFEFF',
  },
  {
    slug: 'page-numbers',
    name: 'Add Page Numbers',
    description: 'Add page numbers to your PDF. Choose position, font size, and starting number.',
    shortDesc: 'Add page numbers to PDF',
    category: 'edit',
    iconColor: '#0EA5E9',
    iconBg: '#F0F9FF',
  },
  {
    slug: 'fill-pdf-form',
    name: 'Fill PDF Form',
    description: 'Fill out PDF forms online — text fields, checkboxes, dropdowns, and radio buttons.',
    shortDesc: 'Fill out PDF forms online',
    category: 'edit',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
  },
  {
    slug: 'sign-pdf',
    name: 'Sign PDF',
    description: 'Sign a PDF by drawing, typing, or uploading your signature, then drag it into place.',
    shortDesc: 'Add your signature to a PDF',
    category: 'edit',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
  },

  // ── IMAGE TOOLS ──────────────────────────────────────────
  {
    slug: 'meme-generator',
    name: 'Meme Generator',
    description: 'Create memes with popular templates or your own image. Add unlimited text layers, drag to reposition, customize font, color, size, and outline.',
    shortDesc: 'Make memes with popular templates',
    category: 'image',
    iconColor: '#EAB308',
    iconBg: '#FEFCE8',
  },
  {
    slug: 'add-text-to-image',
    name: 'Add Text to Image',
    description: 'Place text anywhere on your photo. Multiple layers, 10 fonts, custom colors, rotation, shadows, and background boxes. 100% browser-based.',
    shortDesc: 'Add multi-layer text to photos',
    category: 'image',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
  {
    slug: 'blur-face',
    name: 'Blur Face',
    description: 'Automatically detect and blur faces using on-device AI, or manually draw over any region — license plates, documents, or any sensitive area.',
    shortDesc: 'Auto-blur faces & sensitive areas',
    category: 'image',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
  },
  {
    slug: 'bg-remover',
    name: 'BG Remover',
    description: 'Remove image backgrounds instantly with AI. Free, no signup, no watermarks. Your image is processed and discarded immediately — never stored.',
    shortDesc: 'AI background remover, nothing stored',
    category: 'image',
    iconColor: '#10B981',
    iconBg: '#ECFDF5',
  },
  {
    slug: 'compress-image',
    name: 'Compress Image',
    description: 'Reduce JPG, PNG, and WebP image file size. Adjust quality and choose output format. Batch compress multiple images at once.',
    shortDesc: 'Reduce image file size',
    category: 'image',
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
  },
  {
    slug: 'edit-resize-image',
    name: 'Edit & Resize Image',
    description: 'Resize images by exact pixel dimensions or percentage. Lock aspect ratio or set custom width and height.',
    shortDesc: 'Resize images by pixels or %',
    category: 'image',
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
  },
  {
    slug: 'crop-image',
    name: 'Crop Image',
    description: 'Crop images with an interactive drag-and-resize selection box. Choose freeform or fixed aspect ratios.',
    shortDesc: 'Crop images with drag selection',
    category: 'image',
    iconColor: '#F97316',
    iconBg: '#FFF7ED',
  },
  {
    slug: 'convert-image',
    name: 'Convert Image',
    description: 'Convert images between JPG, PNG, and WebP formats. Rotate and flip in the same step.',
    shortDesc: 'Convert, rotate & flip images',
    category: 'image',
    iconColor: '#EC4899',
    iconBg: '#FDF2F8',
  },

  {
    slug: 'pdf-editor',
    name: 'PDF Editor',
    description: 'Edit PDF files online. Add text, freehand drawings, shapes, arrows, highlights, and whiteout boxes. No uploads, 100% browser-based.',
    shortDesc: 'Add text, shapes & annotations',
    category: 'edit',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },

  // ── VIDEO TOOLS ──────────────────────────────────────────
  {
    slug: 'merge-video',
    name: 'Merge Video',
    description: 'Combine multiple videos into one file. Upload, drag to reorder, merge in one click — same quality as the originals. 100% browser-based.',
    shortDesc: 'Combine multiple videos into one',
    category: 'video',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
  {
    slug: 'youtube-transcript',
    name: 'YouTube Transcript',
    description: 'Get the full transcript of any YouTube video with existing captions. Paste a link, view timestamped text, copy or download as TXT/SRT.',
    shortDesc: 'Extract YouTube video transcripts',
    category: 'video',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
  },
  {
    slug: 'youtube-thumbnail-downloader',
    name: 'YouTube Thumbnail Downloader',
    description: 'Download any YouTube video\'s thumbnail in every available resolution, up to full HD (1280×720). Paste a link, pick a size, download instantly.',
    shortDesc: 'Download YouTube thumbnails in HD',
    category: 'video',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
  },

  // ── SOCIAL TOOLS ─────────────────────────────────────────
  {
    slug: 'caption-character-counter',
    name: 'Caption Character Counter',
    description: 'Live character counter for X/Twitter, Instagram, TikTok, YouTube, Facebook, and LinkedIn. See exactly how much room you have left as you type.',
    shortDesc: 'Character limits for every platform',
    category: 'social',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
  },
  {
    slug: 'hashtag-generator',
    name: 'Hashtag Generator',
    description: 'Generate relevant hashtags for Instagram, TikTok, and X from a topic or keyword. Curated hashtag sets across dozens of popular niches.',
    shortDesc: 'Generate hashtags for any topic',
    category: 'social',
    iconColor: '#9333EA',
    iconBg: '#FAF5FF',
  },

  // ── PDF SECURITY ─────────────────────────────────────────
  {
    slug: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Password protect your PDF to prevent unauthorized access, copying, or editing.',
    shortDesc: 'Password protect your PDF',
    category: 'security',
    iconColor: '#22C55E',
    iconBg: '#F0FDF4',
  },
  {
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove password protection from a PDF you own. Requires the current password.',
    shortDesc: 'Remove PDF password protection',
    category: 'security',
    iconColor: '#F97316',
    iconBg: '#FFF7ED',
  },
]

export const NAV_CATEGORIES: {
  label: string
  key: Tool['category']
  color: string
}[] = [
  { label: 'Organize PDF', key: 'organize', color: '#E84A4A' },
  { label: 'Optimize PDF', key: 'optimize', color: '#3B82F6' },
  { label: 'Convert to PDF', key: 'convert-to', color: '#EC4899' },
  { label: 'Convert from PDF', key: 'convert-from', color: '#A855F7' },
  { label: 'Edit PDF', key: 'edit', color: '#EAB308' },
  { label: 'PDF Security', key: 'security', color: '#22C55E' },
  { label: 'Image Tools', key: 'image', color: '#EC4899' },
  { label: 'Video Tools', key: 'video', color: '#DC2626' },
  { label: 'Social Tools', key: 'social', color: '#9333EA' },
]

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://pdfforge.io'
