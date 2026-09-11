export type ArtCell = [x: number, y: number, w: number, h: number, fill: string]

export type SlideArtData = {
  className: string
  cells: ArtCell[]
  polygon?: { points: string; fill: string }
}

export function getSlideArt(id: string): SlideArtData {
  switch (id) {
    case 'takeoff':
      return {
        className: 'sky',
        cells: [
          [6, 38, 52, 6, '#5a9a3c'], [28, 22, 8, 16, '#c43c32'],
          [14, 26, 36, 4, '#efe6d2'], [30, 14, 4, 8, '#c68642'],
          [26, 18, 12, 3, '#efe6d2'], [31, 10, 6, 5, '#2b2218'],
        ],
        polygon: { points: '32,8 36,20 28,20', fill: '#e2b84a' },
      }
    case 'stone-age':
      return { className: 'crt', cells: [
        [10, 8, 44, 36, '#3a2a22'], [14, 12, 36, 26, '#1a3a1a'],
        [18, 22, 2, 8, '#8fd15a'], [18, 46, 28, 6, '#6b4a22'],
        [22, 52, 20, 4, '#8a5a32'],
      ] }
    case 'inline':
      return { className: 'ghost', cells: [
        [8, 14, 48, 6, '#3a2a22'], [8, 24, 28, 6, '#3a2a22'],
        [38, 24, 18, 6, '#e2b84a'], [8, 34, 40, 6, '#cbb896'],
        [8, 44, 16, 6, '#3a2a22'],
      ] }
    case 'chat':
      return { className: 'chat', cells: [
        [8, 10, 36, 22, '#efe6d2'], [12, 16, 20, 4, '#5c3a1e'],
        [12, 22, 12, 4, '#cbb896'], [20, 32, 8, 6, '#efe6d2'],
        [28, 36, 28, 18, '#3d5a9a'], [34, 42, 16, 4, '#efe6d2'],
      ] }
    case 'agent':
      return { className: 'hands', cells: [
        [22, 8, 20, 16, '#9aa4b0'], [26, 12, 4, 4, '#1b140c'],
        [34, 12, 4, 4, '#1b140c'], [24, 20, 16, 6, '#c43c32'],
        [10, 30, 16, 10, '#c68642'], [38, 30, 16, 10, '#c68642'],
        [8, 42, 48, 14, '#3a2a22'], [12, 46, 8, 6, '#8fd15a'],
      ] }
    case 'trap':
      return { className: 'pile', cells: [
        [12, 36, 40, 16, '#6b4a22'], [16, 24, 32, 12, '#8a5a32'],
        [20, 12, 24, 12, '#c43c32'], [28, 6, 8, 6, '#e2b84a'],
        [18, 40, 28, 4, '#1b140c'],
      ] }
    case 'harness':
      return { className: 'dash', cells: [
        [6, 18, 52, 32, '#3a2a22'], [10, 22, 16, 12, '#8fd15a'],
        [28, 22, 12, 12, '#e2b84a'], [42, 22, 12, 12, '#3d6eaa'],
        [10, 38, 44, 8, '#1b140c'], [14, 40, 8, 4, '#efe6d2'],
        [28, 40, 8, 4, '#efe6d2'], [42, 40, 8, 4, '#efe6d2'],
      ] }
    case 'pipeline':
      return { className: 'gates', cells: [0, 1, 2, 3].flatMap((i): ArtCell[] => [
        [6 + i * 14, 14, 12, 36, i < 2 ? '#5a9a3c' : '#c43c32'],
        [10 + i * 14, 28, 4, 8, '#e2b84a'],
      ]) }
    case 'math':
      return { className: 'bars', cells: [
        [10, 40, 8, 12, '#cbb896'], [22, 30, 8, 22, '#3d6eaa'],
        [34, 20, 8, 32, '#e2b84a'], [46, 10, 8, 42, '#5a9a3c'],
        [8, 52, 48, 3, '#3a2a22'],
      ] }
    case 'quality':
      return { className: 'bug', cells: [
        [22, 18, 20, 16, '#3d7a28'], [16, 22, 6, 4, '#1b140c'],
        [42, 22, 6, 4, '#1b140c'], [26, 22, 4, 4, '#efe6d2'],
        [34, 22, 4, 4, '#efe6d2'], [8, 8, 16, 16, '#c43c32'],
        [12, 12, 8, 8, '#efe6d2'],
      ] }
    case 'compound':
      return { className: 'tree', cells: [
        [28, 36, 8, 20, '#6b4a22'], [16, 24, 32, 14, '#2f7a28'],
        [20, 14, 24, 12, '#3d7a28'], [24, 6, 16, 10, '#5a9a3c'],
        [40, 8, 6, 6, '#e2b84a'],
      ] }
    default:
      return { className: 'flag', cells: [
        [18, 8, 6, 48, '#6b4a22'], [24, 10, 24, 16, '#c43c32'],
        [24, 16, 24, 4, '#e2b84a'], [10, 52, 44, 6, '#5a9a3c'],
      ] }
  }
}
