import { SLIDES } from './slides'

const files = import.meta.glob('../public/assist/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function placeholder(index: number) {
  const slide = SLIDES[index]
  const n = String(index + 1).padStart(2, '0')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
    <rect width="100%" height="100%" fill="#efe0b8"/>
    <rect x="48" y="48" width="1184" height="704" fill="none" stroke="#3a2414" stroke-width="8"/>
    <text x="640" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#5c3a1e">${slide.era}</text>
    <text x="640" y="390" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#1b140c">${slide.title}</text>
    <text x="640" y="480" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#5c3a1e">Drop ${index + 1}_*.png in public/assist</text>
    <text x="1200" y="720" text-anchor="end" font-family="monospace" font-size="28" fill="#8a6230">${n}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function assistSrc(index: number) {
  const prefix = `${index + 1}_`
  for (const [path, url] of Object.entries(files)) {
    const name = path.split('/').pop() ?? ''
    if (name.startsWith(prefix)) return url
  }
  return placeholder(index)
}
