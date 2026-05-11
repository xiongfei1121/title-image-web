<script setup lang="ts">
import { Sun, Moon, SunMoon } from 'lucide-vue-next'
import { APP_THEME } from '~/utils/utils'
import { useTitleStore } from '~/stores/title'

const titleStore = useTitleStore()

function toggleTheme() {
  const themes = [APP_THEME.LIGHT, APP_THEME.DARK, APP_THEME.SYSTEM]
  const currentIndex = themes.indexOf(titleStore.appTheme)
  titleStore.appTheme = themes[(currentIndex + 1) % themes.length]
}
</script>

<template>
  <header class="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white dark:bg-gray-800 text-sm py-3 border-b border-gray-200 dark:border-gray-700">
    <nav class="w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
      <div class="flex items-center justify-between">
        <a href="/" class="flex items-center gap-2">
          <img class="size-10" src="/images/logo.png" alt="logo" />
          <h2 class="hidden sm:block text-gray-900 dark:text-gray-100 text-lg">
            <span class="font-medium">老熊</span>标题图片生成
          </h2>
        </a>
      </div>
      <ClientOnly>
        <button
          v-if="titleStore.appTheme === APP_THEME.LIGHT"
          type="button"
          class="ml-4 text-gray-600 hover:text-blue-500"
          @click="toggleTheme"
        >
          <Sun class="size-5" />
        </button>
        <button
          v-if="titleStore.appTheme === APP_THEME.DARK"
          type="button"
          class="ml-4 text-gray-400 hover:text-blue-400"
          @click="toggleTheme"
        >
          <Moon class="size-5" />
        </button>
        <button
          v-if="titleStore.appTheme === APP_THEME.SYSTEM"
          type="button"
          class="ml-4 text-gray-600 hover:text-blue-500"
          @click="toggleTheme"
        >
          <SunMoon class="size-5" />
        </button>
        <template #fallback>
          <div class="size-5 ml-4" />
        </template>
      </ClientOnly>
    </nav>
  </header>
</template>
