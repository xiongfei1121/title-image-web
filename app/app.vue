<script setup lang="ts">
import { useTitleStore } from '~/stores/title'

const titleStore = useTitleStore()

useHead({
  title: '🐻老熊标题图片生成器',
  meta: [
    {
      name: 'description',
      content: '免费在线标题图片生成器，支持多行文字自动排版，支持自定义颜色和宽度',
    },
  ],
})
</script>

<template>
  <div class="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
    <PageHeader />
    <NuxtPage class="flex-1" />
    <PageFooter />
  </div>
</template>
