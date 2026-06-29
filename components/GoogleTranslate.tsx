'use client'

import { useEffect, useRef, useState } from 'react'

const LANGUAGES = [
  { code: 'en',    label: 'English',    flag: '🇺🇸' },
  { code: 'es',    label: 'Español',    flag: '🇪🇸' },
  { code: 'fr',    label: 'Français',   flag: '🇫🇷' },
  { code: 'de',    label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ar',    label: 'العربية',    flag: '🇸🇦' },
  { code: 'zh-CN', label: '中文',        flag: '🇨🇳' },
  { code: 'hi',    label: 'हिंदी',      flag: '🇮🇳' },
  { code: 'pt',    label: 'Português',  flag: '🇧🇷' },
  { code: 'ru',    label: 'Русский',    flag: '🇷🇺' },
  { code: 'ja',    label: '日本語',      flag: '🇯🇵' },
  { code: 'ko',    label: '한국어',      flag: '🇰🇷' },
  { code: 'it',    label: 'Italiano',   flag: '🇮🇹' },
  { code: 'tr',    label: 'Türkçe',     flag: '🇹🇷' },
  { code: 'nl',    label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl',    label: 'Polski',     flag: '🇵🇱' },
  { code: 'ur',    label: 'اردو',       flag: '🇵🇰' },
]

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any
  }
}

function applyLanguage(code: string) {
  try {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null
    if (combo) {
      combo.value = code
      combo.dispatchEvent(new Event('change'))
    }
  } catch {}
}

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(LANGUAGES[0])
  const ref = useRef<HTMLDivElement>(null)

  // Suppress fetch errors thrown by Google Translate's script
  // (often triggered by browser extensions intercepting requests)
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (
        typeof e.message === 'string' &&
        (e.message.includes('translate') || e.message.includes('Failed to fetch'))
      ) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    const onUnhandled = (e: PromiseRejectionEvent) => {
      const msg = String(e.reason?.message ?? e.reason ?? '')
      if (msg.includes('translate') || msg.includes('Failed to fetch')) {
        e.preventDefault()
      }
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  }, [])

  // Load Google Translate widget once (hidden)
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return
      try {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          '__gt_hidden__'
        )
      } catch {}
    }
    if (!document.getElementById('gt-script')) {
      const s = document.createElement('script')
      s.id = 'gt-script'
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      s.async = true
      s.onerror = () => {} // silently fail if blocked
      document.body.appendChild(s)
    } else {
      window.googleTranslateElementInit?.()
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(lang: typeof LANGUAGES[0]) {
    setCurrent(lang)
    setOpen(false)
    // Give GT widget a moment to init on first use
    setTimeout(() => applyLanguage(lang.code), 300)
  }

  return (
    <>
      {/* Hidden GT element — never visible */}
      <div id="__gt_hidden__" className="hidden" aria-hidden="true" />

      {/* Custom dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-mute hover:text-ink hover:bg-line/60 transition-colors border border-transparent hover:border-line/80"
          aria-label="Select language"
          aria-expanded={open}
        >
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
          <span className="text-xs font-semibold tracking-wide">{current.code.toUpperCase().slice(0, 2)}</span>
          <svg className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-[200] overflow-hidden">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Select Language
            </p>
            <div className="max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => select(lang)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                    current.code === lang.code
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {current.code === lang.code && (
                    <svg className="w-3.5 h-3.5 ml-auto text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
