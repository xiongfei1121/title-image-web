<script setup lang="ts">
import { Download, RefreshCw, Trash2 } from 'lucide-vue-next'
import { useTitleStore } from '~/stores/title'

const titleStore = useTitleStore()
// i18n disabled

// Color input helpers
function getTextColorHex() {
  const [r, g, b] = titleStore.textColor
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function getBgColorHex() {
  const [r, g, b] = titleStore.bgColor
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function onTextColorChange(e: Event) {
  const hex = (e.target as HTMLInputElement).value
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  titleStore.setTextColor([r, g, b])
}

function onBgColorChange(e: Event) {
  const hex = (e.target as HTMLInputElement).value
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  titleStore.setBgColor([r, g, b])
}

async function downloadImage() {
  if (!titleStore.generatedImage) return
  const img = titleStore.generatedImage
  const response = await fetch(img)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'title_image.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Enter' && index < titleStore.lines.length - 1) {
    // Focus next line input
    const inputs = document.querySelectorAll('.line-input') as NodeListOf<HTMLInputElement>
    const nextInput = inputs[index + 1]
    if (nextInput) nextInput.focus()
  }
}
</script>

<template>
  <div class="container max-w-4xl mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">输入标题文字</h1>
      
      <!-- Line inputs -->
      <div class="space-y-4 mb-6">
        <div v-for="(line, index) in titleStore.lines.slice(0, 4)" :key="index" class="flex gap-4 items-start">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <input
              v-model="titleStore.lines[index].text"
              type="text"
              :placeholder="index === 0 ? '第一行：标题（大字）' : index === 3 ? '第四行：结尾（小字，选填）' : '内容行'"
              class="line-input w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @keydown="handleKeydown($event, index)"
              @input="titleStore.clearImage()"
            />
          </div>
          <div class="flex-shrink-0 w-32">
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">字号</label>
            <input
              type="number"
              v-model.number="titleStore.lines[index].fontSize"
              min="20"
              max="200"
              placeholder="自动"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
              @input="titleStore.clearImage()"
            />
          </div>
        </div>
      </div>
      
      <!-- Settings -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图片宽度</label>
          <input
            type="number"
            v-model.number="titleStore.width"
            min="500"
            max="3000"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            @change="titleStore.clearImage()"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">文字颜色</label>
          <div class="flex gap-2">
            <input
              type="color"
              :value="getTextColorHex()"
              @input="onTextColorChange"
              class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              :value="getTextColorHex()"
              @change="onTextColorChange"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-mono text-sm"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">背景颜色</label>
          <div class="flex gap-2">
            <input
              type="color"
              :value="getBgColorHex()"
              @input="onBgColorChange"
              class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              :value="getBgColorHex()"
              @change="onBgColorChange"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-mono text-sm"
            />
          </div>
        </div>
      </div>
      
      <!-- Buttons -->
      <div class="flex flex-wrap gap-3">
        <button
          @click="titleStore.generateImage()"
          :disabled="titleStore.loading"
          class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw v-if="titleStore.loading" class="size-4 animate-spin" />
          <span v-if="titleStore.loading">生成中...</span>
          <span v-else>生成图片</span>
        </button>
        <button
          @click="titleStore.reset()"
          class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 class="size-4" />
          重置
        </button>
      </div>
      
      <!-- Error -->
      <div v-if="titleStore.error" class="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
        {{ titleStore.error }}
      </div>
    </div>
    
    <!-- Preview -->
    <div v-if="titleStore.generatedImage" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">预览</h2>
        <button
          @click="downloadImage"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download class="size-4" />
          下载
        </button>
      </div>
      <!-- 显示实际使用的字号 -->
      <div v-if="titleStore.generatedFontSizes" class="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前字号（供参考）</p>
        <div class="flex flex-wrap gap-2">
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
            第一行: {{ titleStore.generatedFontSizes.line1_size || titleStore.generatedFontSizes.main_size || '?' }}px
          </span>
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
            第二行: {{ titleStore.generatedFontSizes.line2_size || '?' }}px
          </span>
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
            第三行: {{ titleStore.generatedFontSizes.line3_size || '?' }}px
          </span>
          <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
            第四行: {{ titleStore.generatedFontSizes.end_line_size || '?' }}px
          </span>
        </div>
      </div>
      <div class="text-center">
        <img
          :src="titleStore.generatedImage"
          alt="生成的标题图片"
          class="max-w-full rounded-lg shadow-md"
        />
      </div>
    </div>
  </div>
</template>
