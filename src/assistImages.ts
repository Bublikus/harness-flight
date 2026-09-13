import { plain } from './slideMarkup'
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
    <rect width="100%" height="100%" fill="#120e0a"/>
    <rect x="40" y="40" width="1200" height="720" fill="#1a1410" stroke="#5c3a1e" stroke-width="8"/>
    <rect x="56" y="56" width="1168" height="688" fill="none" stroke="#3a2414" stroke-width="4"/>
    <text x="640" y="300" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="22" fill="#e2b84a">${slide.era}</text>
    <text x="640" y="390" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="36" fill="#f4ead2">${plain(slide.title)}</text>
    <text x="640" y="480" text-anchor="middle" font-family="'Press Start 2P', monospace" font-size="14" fill="#a88858">Drop ${index + 1}_*.png in public/assist</text>
    <text x="1200" y="720" text-anchor="end" font-family="'Press Start 2P', monospace" font-size="18" fill="#e2b84a">${n}</text>
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
