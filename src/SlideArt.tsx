import type { ReactNode } from 'react'

function Px({
  className,
  children,
}: {
  className: string
  children: ReactNode
}) {
  return (
    <div className={`illu ${className}`} aria-hidden>
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        {children}
      </svg>
    </div>
  )
}

const cell = (x: number, y: number, w: number, h: number, fill: string) => (
  <rect x={x} y={y} width={w} height={h} fill={fill} />
)

export function SlideArt({ id }: { id: string }) {
  switch (id) {
    case 'takeoff':
      return (
        <Px className="sky">
          {cell(6, 38, 52, 6, '#5a9a3c')}
          {cell(28, 22, 8, 16, '#c43c32')}
          {cell(14, 26, 36, 4, '#efe6d2')}
          {cell(30, 14, 4, 8, '#c68642')}
          {cell(26, 18, 12, 3, '#efe6d2')}
          {cell(31, 10, 6, 5, '#2b2218')}
          <polygon points="32,8 36,20 28,20" fill="#e2b84a" />
        </Px>
      )
    case 'stone-age':
      return (
        <Px className="crt">
          {cell(10, 8, 44, 36, '#3a2a22')}
          {cell(14, 12, 36, 26, '#1a3a1a')}
          {cell(18, 22, 2, 8, '#8fd15a')}
          {cell(18, 46, 28, 6, '#6b4a22')}
          {cell(22, 52, 20, 4, '#8a5a32')}
        </Px>
      )
    case 'inline':
      return (
        <Px className="ghost">
          {cell(8, 14, 48, 6, '#3a2a22')}
          {cell(8, 24, 28, 6, '#3a2a22')}
          {cell(38, 24, 18, 6, '#e2b84a')}
          {cell(8, 34, 40, 6, '#cbb896')}
          {cell(8, 44, 16, 6, '#3a2a22')}
        </Px>
      )
    case 'chat':
      return (
        <Px className="chat">
          {cell(8, 10, 36, 22, '#efe6d2')}
          {cell(12, 16, 20, 4, '#5c3a1e')}
          {cell(12, 22, 12, 4, '#cbb896')}
          {cell(20, 32, 8, 6, '#efe6d2')}
          {cell(28, 36, 28, 18, '#3d5a9a')}
          {cell(34, 42, 16, 4, '#efe6d2')}
        </Px>
      )
    case 'agent':
      return (
        <Px className="hands">
          {cell(22, 8, 20, 16, '#9aa4b0')}
          {cell(26, 12, 4, 4, '#1b140c')}
          {cell(34, 12, 4, 4, '#1b140c')}
          {cell(24, 20, 16, 6, '#c43c32')}
          {cell(10, 30, 16, 10, '#c68642')}
          {cell(38, 30, 16, 10, '#c68642')}
          {cell(8, 42, 48, 14, '#3a2a22')}
          {cell(12, 46, 8, 6, '#8fd15a')}
        </Px>
      )
    case 'trap':
      return (
        <Px className="pile">
          {cell(12, 36, 40, 16, '#6b4a22')}
          {cell(16, 24, 32, 12, '#8a5a32')}
          {cell(20, 12, 24, 12, '#c43c32')}
          {cell(28, 6, 8, 6, '#e2b84a')}
          {cell(18, 40, 28, 4, '#1b140c')}
        </Px>
      )
    case 'harness':
      return (
        <Px className="dash">
          {cell(6, 18, 52, 32, '#3a2a22')}
          {cell(10, 22, 16, 12, '#8fd15a')}
          {cell(28, 22, 12, 12, '#e2b84a')}
          {cell(42, 22, 12, 12, '#3d6eaa')}
          {cell(10, 38, 44, 8, '#1b140c')}
          {cell(14, 40, 8, 4, '#efe6d2')}
          {cell(28, 40, 8, 4, '#efe6d2')}
          {cell(42, 40, 8, 4, '#efe6d2')}
        </Px>
      )
    case 'pipeline':
      return (
        <Px className="gates">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              {cell(6 + i * 14, 14, 12, 36, i < 2 ? '#5a9a3c' : '#c43c32')}
              {cell(10 + i * 14, 28, 4, 8, '#e2b84a')}
            </g>
          ))}
        </Px>
      )
    case 'math':
      return (
        <Px className="bars">
          {cell(10, 40, 8, 12, '#cbb896')}
          {cell(22, 30, 8, 22, '#3d6eaa')}
          {cell(34, 20, 8, 32, '#e2b84a')}
          {cell(46, 10, 8, 42, '#5a9a3c')}
          {cell(8, 52, 48, 3, '#3a2a22')}
        </Px>
      )
    case 'quality':
      return (
        <Px className="bug">
          {cell(22, 18, 20, 16, '#3d7a28')}
          {cell(16, 22, 6, 4, '#1b140c')}
          {cell(42, 22, 6, 4, '#1b140c')}
          {cell(26, 22, 4, 4, '#efe6d2')}
          {cell(34, 22, 4, 4, '#efe6d2')}
          {cell(8, 8, 16, 16, '#c43c32')}
          {cell(12, 12, 8, 8, '#efe6d2')}
        </Px>
      )
    case 'compound':
      return (
        <Px className="tree">
          {cell(28, 36, 8, 20, '#6b4a22')}
          {cell(16, 24, 32, 14, '#2f7a28')}
          {cell(20, 14, 24, 12, '#3d7a28')}
          {cell(24, 6, 16, 10, '#5a9a3c')}
          {cell(40, 8, 6, 6, '#e2b84a')}
        </Px>
      )
    default:
      return (
        <Px className="flag">
          {cell(18, 8, 6, 48, '#6b4a22')}
          {cell(24, 10, 24, 16, '#c43c32')}
          {cell(24, 16, 24, 4, '#e2b84a')}
          {cell(10, 52, 44, 6, '#5a9a3c')}
        </Px>
      )
  }
}
