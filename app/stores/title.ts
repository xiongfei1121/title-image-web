import { defineStore } from 'pinia'
import { APP_THEME } from '~/utils/utils'

interface LineConfig {
  text: string
  fontSize?: number
}

export const useTitleStore = defineStore('title', {
  state: () => ({
    lines: [
      { text: '', fontSize: undefined } as LineConfig,
      { text: '', fontSize: undefined } as LineConfig,
      { text: '', fontSize: undefined } as LineConfig,
      { text: '', fontSize: undefined } as LineConfig,
    ] as LineConfig[],
    width: 1453,
    textColor: [42, 76, 140] as [number, number, number],
    bgColor: [255, 255, 255] as [number, number, number],
    format: 'url' as 'url' | 'base64' | 'image',
    generatedImage: null as string | null,
    generatedFontSizes: null as Record<string, number> | null,
    loading: false,
    error: null as string | null,
    appTheme: APP_THEME.SYSTEM,
  }),
  
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
    
    setWidth(width: number) {
      this.width = width
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
      
      // 获取有效行（去掉空行）
      const validLines = this.lines
        .slice(0, 4)
        .filter(line => line.text.trim())
        .map(line => line.text.trim())
      
      if (validLines.length < 2) {
        this.error = '至少需要2行有效文字'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        // 构建自定义字号
        const customSizes: Record<string, number> = {}
        validLines.forEach((_, index) => {
          const fontSize = this.lines[index].fontSize
          if (fontSize) {
            customSizes[`line${index + 1}`] = fontSize
          }
        })
        
        const response = await fetch(`${apiBase}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lines: validLines,
            width: this.width,
            text_color: this.textColor,
            bg_color: this.bgColor,
            format: 'url',
            custom_sizes: Object.keys(customSizes).length > 0 ? customSizes : null,
          }),
        })
        
        const data = await response.json()
        
        if (data.success) {
          this.generatedImage = data.url
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
        { text: '', fontSize: undefined },
        { text: '', fontSize: undefined },
        { text: '', fontSize: undefined },
        { text: '', fontSize: undefined },
      ]
      this.width = 1453
      this.textColor = [42, 76, 140]
      this.bgColor = [255, 255, 255]
      this.generatedImage = null
      this.generatedFontSizes = null
      this.error = null
    },
  
  persist: {
    pick: ['width', 'textColor', 'bgColor', 'appTheme'],
  },
})
