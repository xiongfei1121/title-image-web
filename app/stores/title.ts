import { defineStore } from 'pinia'
import { APP_THEME } from '~/utils/utils'

export type FontType = 'hei' | 'main'

interface LineConfig {
  text: string
  fontSize?: number
  font: FontType
  checked: boolean
  scaleX: number
  scaleY: number
}

// 拉伸系数范围（与后端 SCALE_MIN/SCALE_MAX 保持一致）
export const SCALE_MIN = 0.3
export const SCALE_MAX = 3

// 行间距范围（与后端 LINE_GAP_MIN/LINE_GAP_MAX 保持一致）
export const LINE_GAP_MIN = -200
export const LINE_GAP_MAX = 500
export const LINE_GAP_DEFAULT = 45

export function clampScale(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 1
  return Math.min(Math.max(n, SCALE_MIN), SCALE_MAX)
}

export function clampLineGap(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return LINE_GAP_DEFAULT
  return Math.min(Math.max(n, LINE_GAP_MIN), LINE_GAP_MAX)
}

function createLine(font: FontType, checked: boolean): LineConfig {
  return { text: '', fontSize: undefined, font, checked, scaleX: 1, scaleY: 1 }
}

export const useTitleStore = defineStore('title', {
  state: () => ({
    lines: [
      createLine('main', true),
      createLine('main', true),
      createLine('main', true),
      createLine('hei', true),
      createLine('hei', false),
    ] as LineConfig[],
    width: 1453,
    lineGap: LINE_GAP_DEFAULT,
    textColor: [42, 76, 140] as [number, number, number],
    bgColor: [255, 255, 255] as [number, number, number],
    format: 'url' as 'url' | 'base64' | 'image',
    generatedImage: null as string | null,
    generatedFontSizes: null as Record<string, number> | null,
    generatedMeta: null as { width: number; height: number; lineGap: number | null } | null,
    loading: false,
    error: null as string | null,
    appTheme: APP_THEME.SYSTEM,
  }),
  
  getters: {
    // 获取勾选的行
    checkedLines: (state) => {
      return state.lines.filter(line => line.checked && line.text.trim())
    },
    // 获取勾选行的索引（用于构建fonts和custom_sizes）
    checkedLineIndices: (state) => {
      return state.lines
        .map((line, index) => ({ index, line }))
        .filter(item => item.line.checked && item.line.text.trim())
        .map(item => item.index)
    },
  },
  
  actions: {
    setLineText(index: number, text: string) {
      if (index < this.lines.length) {
        this.lines[index].text = text
        this.generatedImage = null
        this.generatedFontSizes = null
      }
    },
    
    setLineFontSize(index: number, fontSize: number) {
      if (index < this.lines.length) {
        this.lines[index].fontSize = fontSize
        this.generatedImage = null
        this.generatedFontSizes = null
      }
    },
    
    setLineFont(index: number, font: FontType) {
      if (index < this.lines.length) {
        this.lines[index].font = font
        this.generatedImage = null
        this.generatedFontSizes = null
      }
    },
    
toggleLineChecked(index: number) {
      if (index < this.lines.length) {
        this.lines[index].checked = !this.lines[index].checked
        this.generatedImage = null
        this.generatedFontSizes = null
      }
    },

    setLineScale(index: number, axis: 'x' | 'y', value: number | string) {
      if (index < this.lines.length) {
        const v = clampScale(value)
        if (axis === 'x') this.lines[index].scaleX = v
        else this.lines[index].scaleY = v
        this.generatedImage = null
        this.generatedFontSizes = null
      }
    },

    // 兼容旧版本 localStorage：补齐每行缺失的字段（checked/font/scaleX/scaleY）
    ensureLineDefaults() {
      this.lines.forEach((line) => {
        if (line.checked === undefined) line.checked = true
        if (line.font !== 'hei' && line.font !== 'main') line.font = 'main'
        line.scaleX = clampScale(line.scaleX)
        line.scaleY = clampScale(line.scaleY)
      })
      this.lineGap = clampLineGap(this.lineGap)
      if (!this.width || !Number.isFinite(Number(this.width))) this.width = 1453
    },
    
    setWidth(width: number) {
      this.width = width
      this.generatedImage = null
      this.generatedFontSizes = null
    },
    
    setLineGap(lineGap: number) {
      this.lineGap = lineGap
      this.generatedImage = null
      this.generatedFontSizes = null
    },
    
    
    
    setTextColor(color: [number, number, number]) {
      this.textColor = color
      this.generatedImage = null
      this.generatedFontSizes = null
    },
    
    setBgColor(color: [number, number, number]) {
      this.bgColor = color
      this.generatedImage = null
      this.generatedFontSizes = null
    },
    
    setFormat(format: 'url' | 'base64' | 'image') {
      this.format = format
    },
    
    async generateImage() {
      const config = useRuntimeConfig()
      const apiBase = config.public.apiBase
      
      // 获取勾选的行
      const checkedLines = this.lines
        .filter(line => line.checked && line.text.trim())
        .map(line => line.text.trim())
      
      if (checkedLines.length < 2) {
        this.error = '请至少勾选2行有效文字'
        return
      }
      
// 构建字体/字号/拉伸列表（按勾选行的输出顺序，与后端逐行一一对应）
      const fonts: FontType[] = []
      const customSizes: Record<string, number> = {}
      const scaleXs: number[] = []
      const scaleYs: number[] = []
      let outputIndex = 1
      
      this.lines.forEach((line) => {
        if (line.checked && line.text.trim()) {
          fonts.push(line.font)
          if (line.fontSize) {
            customSizes[`line${outputIndex}`] = line.fontSize
          }
          scaleXs.push(clampScale(line.scaleX))
          scaleYs.push(clampScale(line.scaleY))
          outputIndex++
        }
      })
      
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`${apiBase}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lines: checkedLines,
            fonts: fonts,
            width: this.width,
            text_color: this.textColor,
            bg_color: this.bgColor,
format: 'url',
            custom_sizes: Object.keys(customSizes).length > 0 ? customSizes : null,
            line_gap: clampLineGap(this.lineGap),
            scale_x: scaleXs,
            scale_y: scaleYs,
          }),
        })
        
const data = await response.json()
        
        if (data.success) {
          // Fix http -> https
          const url = data.url.replace(/^http:/, 'https:').replace(/[?&]_t=\d+$/, '') + '?_t=' + Date.now()
          this.generatedImage = url
          // Store actual font sizes used in the generated image
          if (data.font_sizes) {
            this.generatedFontSizes = data.font_sizes
          }
          this.generatedMeta = {
            width: data.width,
            height: data.height,
            lineGap: typeof data.line_gap === 'number' ? data.line_gap : null,
          }
        } else {
          this.error = data.error || '生成失败'
        }
      } catch (err) {
        this.error = '网络请求失败，请检查API是否可用'
      } finally {
        this.loading = false
      }
    },
    
    clearImage() {
      this.generatedImage = null
      this.error = null
    },
    
reset() {
      this.lines = [
        createLine('main', true),
        createLine('main', true),
        createLine('main', true),
        createLine('hei', true),
        createLine('hei', false),
      ]
      this.width = 1453
      this.lineGap = LINE_GAP_DEFAULT
      this.textColor = [42, 76, 140]
      this.bgColor = [255, 255, 255]
      this.generatedImage = null
      this.generatedFontSizes = null
      this.generatedMeta = null
      this.error = null
    },
  },
  
  persist: {
    pick: ['width', 'lineGap', 'textColor', 'bgColor', 'appTheme', 'lines'],
  },
})
