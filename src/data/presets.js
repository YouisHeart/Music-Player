import { assetUrl } from '@/utils/asset'

export const WALLPAPERS = [
  {
    id: 'neon-city',
    name: '霓虹都市',
    description: '雨夜天际线',
    src: assetUrl('/wallpapers/neon-city.webp'),
    accent: '#4f8dff',
  },
  {
    id: 'sakura-shrine',
    name: '夜樱神社',
    description: '花与灯火',
    src: assetUrl('/wallpapers/sakura-shrine.webp'),
    accent: '#c084fc',
  },
  {
    id: 'rain-alley',
    name: '雨巷霓虹',
    description: '赛博街景',
    src: assetUrl('/wallpapers/rain-alley.webp'),
    accent: '#e879f9',
  },
  {
    id: 'star-lake',
    name: '星湖极光',
    description: '深空静域',
    src: assetUrl('/wallpapers/star-lake.webp'),
    accent: '#22d3ee',
  },
]

export const NEON_PRESETS = [
  { id: 'azure', name: '量子蓝', color: '#4f8dff' },
  { id: 'cyan', name: '霓虹青', color: '#22d3ee' },
  { id: 'violet', name: '星云紫', color: '#a855f7' },
  { id: 'magenta', name: '赛博粉', color: '#f43f8e' },
  { id: 'aqua', name: '极光绿', color: '#5eead4' },
  { id: 'amber', name: '黄昏橙', color: '#f59e0b' },
]

export const VINYL_SKINS = [
  {
    id: 'obsidian',
    name: '曜石黑',
    hint: '经典黑胶',
    vars: {
      '--vinyl-base': '#06080d',
      '--vinyl-edge': '#151b28',
      '--vinyl-groove': 'rgba(255, 255, 255, 0.055)',
      '--vinyl-sheen': 'rgba(140, 190, 255, 0.18)',
      '--vinyl-glow': 'rgba(90, 140, 255, 0.3)',
    },
  },
  {
    id: 'nebula',
    name: '星云紫',
    hint: '迷幻紫胶',
    vars: {
      '--vinyl-base': '#0c0716',
      '--vinyl-edge': '#291542',
      '--vinyl-groove': 'rgba(226, 190, 255, 0.06)',
      '--vinyl-sheen': 'rgba(190, 120, 255, 0.24)',
      '--vinyl-glow': 'rgba(168, 85, 247, 0.38)',
    },
  },
  {
    id: 'abyss',
    name: '深海蓝',
    hint: '冷调蓝胶',
    vars: {
      '--vinyl-base': '#030b16',
      '--vinyl-edge': '#0a2338',
      '--vinyl-groove': 'rgba(150, 220, 255, 0.06)',
      '--vinyl-sheen': 'rgba(80, 200, 255, 0.24)',
      '--vinyl-glow': 'rgba(34, 211, 238, 0.32)',
    },
  },
  {
    id: 'gold',
    name: '鎏金',
    hint: '限量金胶',
    vars: {
      '--vinyl-base': '#0c0904',
      '--vinyl-edge': '#2d2410',
      '--vinyl-groove': 'rgba(255, 226, 160, 0.06)',
      '--vinyl-sheen': 'rgba(255, 200, 90, 0.22)',
      '--vinyl-glow': 'rgba(245, 190, 80, 0.3)',
    },
  },
  {
    id: 'prism',
    name: '极光',
    hint: '幻彩透明',
    vars: {
      '--vinyl-base': '#080c16',
      '--vinyl-edge': '#1c2644',
      '--vinyl-groove': 'rgba(255, 255, 255, 0.075)',
      '--vinyl-sheen': 'rgba(120, 255, 240, 0.26)',
      '--vinyl-glow': 'rgba(94, 234, 212, 0.34)',
    },
  },
]

export const EQ_PRESETS = [
  { id: 'flat', name: '平坦', bands: [0, 0, 0] },
  { id: 'pop', name: '流行', bands: [-1, 2, 2] },
  { id: 'bass', name: '低音', bands: [7, 1, -1] },
  { id: 'vocal', name: '人声', bands: [-2, 4, 2] },
  { id: 'electronic', name: '电子', bands: [5, -1, 3] },
  { id: 'warm', name: '温暖', bands: [3, 2, -2] },
]

export const EQ_BANDS = [
  { id: 'low', label: '低频', frequency: '120 Hz' },
  { id: 'mid', label: '中频', frequency: '1 kHz' },
  { id: 'high', label: '高频', frequency: '6 kHz' },
]
