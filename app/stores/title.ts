import { defineStore } from 'pinia'
import { APP_THEME } from '~/utils/utils'

export type FontType = 'hei' | 'main'

interface LineConfig {
  text: string
  fontSize?: number
  font: FontType
  checked: boolean
}

export const useTitleStore = defineStore('title', {
  state: () => ({
    lines: [
      { text: '', fontSize: undefined, font: 'main' as FontType, checked: true },
      { text: '', fontSize: undefined, font: 'main' as FontType, checked: true },
      { text: '', fontSize: undefined, font: 'main' as FontType, checked: true },
      { text: '', fontSize: undefined, font: 'hei' as FontType, checked: true },
      { text: '', fontSize: undefined, font: 'hei' as FontType, checked: false },
    ] as LineConfig[],
    width: 1453,
    lineGap: 15,
    textColor: [42, 76, 140] as [number, number, number],
    bgColor: [255, 255, 255] as [number, number, number],
    format: 'url' as 'url' | 'base64' | 'image',
    generatedImage: null as string | null,
    generatedFontSizes: null as Record<string, number> | null,
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
      
      // 构建字体列表（按勾选行的顺序）
      const fonts: FontType[] = []
      const customSizes: Record<string, number> = {}
      let outputIndex = 1
      
      this.lines.forEach((line, index) => {
        if (line.checked && line.text.trim()) {
          fonts.push(line.font)
          if (line.fontSize) {
            customSizes[`line${outputIndex}`] = line.fontSize
          }
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
            line_gap: this.lineGap,
          }),
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Fix http -> https, add timestamp to prevent caching
          const url = data.url.replace(/^http:/, 'https:') + '?t=' + Date.now()
          this.generatedImage = url
          // Store actual font sizes used in the generated image
          if (data.font_sizes) {
            this.generatedFontSizes = data.font_sizes
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
        { text: '', fontSize: undefined, font: 'main', checked: true },
        { text: '', fontSize: undefined, font: 'main', checked: true },
        { text: '', fontSize: undefined, font: 'main', checked: true },
        { text: '', fontSize: undefined, font: 'hei', checked: true },
        { text: '', fontSize: undefined, font: 'hei', checked: false },
      ]
      this.width = 1453
      this.lineGap = 15
      this.textColor = [42, 76, 140]
      this.bgColor = [255, 255, 255]
      this.generatedImage = null
      this.generatedFontSizes = null
      this.error = null
    },
  },
  
  persist: {
    pick: ['width', 'lineGap', 'textColor', 'bgColor', 'appTheme', 'lines'],
  },
})
