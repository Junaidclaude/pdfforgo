'use client'

import { useEffect } from 'react'

export default function RevealOnScroll() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal, [data-reveal]').forEach((el) =>
      io.observe(el)
    )
    return () => io.disconnect()
  }, [])

  return null
}
