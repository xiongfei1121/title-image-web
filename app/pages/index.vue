<script setup lang="ts">
import { Download, RefreshCw, Trash2 } from 'lucide-vue-next'
import { useTitleStore } from '~/stores/title'

const titleStore = useTitleStore()

const fontLabels = {
  main: '兰亭特黑',
  hei: '方正黑体',
}

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
    const inputs = document.querySelectorAll('.line-input') as NodeListOf<HTMLInputElement>
    const nextInput = inputs[index + 1]
    if (nextInput) nextInput.focus()
  }
}

const linePlaceholders = [
  '第一行：标题（大字）',
  '第二行：主内容',
  '第三行：主内容',
  '第四行：内容或结尾',
  '第五行：结尾（选填）',
]
</script>

<template>
  <div class="container max-w-5xl mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">输入标题文字</h1>
      
      <!-- Line inputs -->
      <div class="space-y-3 mb-6">
        <div
          v-for="(line, index) in titleStore.lines"
          :key="index"
          class="flex gap-3 items-start"
          :class="{ 'opacity-50': !line.checked }"
        >
          <!-- Checkbox -->
          <div class="flex-shrink-0 pt-3">
            <input
              type="checkbox"
              v-model="line.checked"
              class="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              @change="titleStore.clearImage()"
            />
          </div>
          
          <!-- Line number -->
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm mt-1">
            {{ index + 1 }}
          </div>
          
          <!-- Text input -->
          <div class="flex-1">
            <input
              v-model="titleStore.lines[index].text"
              type="text"
              :placeholder="linePlaceholders[index]"
              class="line-input w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :disabled="!line.checked"
              @keydown="handleKeydown($event, index)"
              @input="titleStore.clearImage()"
            />
          </div>
          
          <!-- Font selector -->
          <div class="flex-shrink-0 w-28">
            <label class="text-xs text-gray-500 dark:text-gray-400 mb-1 block">字体</label>
            <select
              v-model="titleStore.lines[index].font"
              class="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm"
              @change="titleStore.clearImage()"
            >
              <option value="main">兰亭特黑</option>
              <option value="hei">方正黑体</option>
            </select>
          </div>
          
          <!-- Font size -->
          <div class="flex-shrink-0 w-24">
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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-4xl mx-auto">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">图片宽度</label>
          <input
            type="number"
            v-model.number="titleStore.width"
            min="500"
            max="3000"
            class="w-full max-w-[140px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            @change="titleStore.clearImage()"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">行间距</label>
          <input
            type="number"
            v-model.number="titleStore.lineGap"
            min="0"
            max="200"
            class="w-full max-w-[140px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
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
              class="w-10 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              :value="getTextColorHex()"
              @change="onTextColorChange"
              class="w-full max-w-[90px] px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-mono text-sm"
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
              class="w-10 h-9 rounded border border-gray-300 dark:border-gray-600 cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              :value="getBgColorHex()"
              @change="onBgColorChange"
              class="w-full max-w-[90px] px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-mono text-sm"
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
          <span
            v-for="(value, key) in titleStore.generatedFontSizes"
            :key="key"
            class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
          >
            {{ key.replace('_size', '') }}: {{ value }}px
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
