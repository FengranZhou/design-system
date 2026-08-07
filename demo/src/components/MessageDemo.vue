<template>
  <section id="message" class="demo-section">
    <h2 class="demo-section__title">Message 消息提示</h2>

    <div class="demo-block">
      <p class="demo-desc">希望不打断用户操作，并给予轻量提示。</p>
      <div class="demo-row">
        <el-button @click="showMessage('success')">Success</el-button>
        <el-button @click="showMessage('warning')">Warning</el-button>
        <el-button @click="showMessage('error')">Error</el-button>
        <el-button @click="showMessage('info')">Info</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const messageTexts: Record<string, string> = {
  success: '操作成功，数据已保存',
  warning: '请注意，该操作不可撤销',
  error: '操作失败，请稍后重试',
  info: '这是一条信息提示',
}

const showMessage = (type: 'success' | 'warning' | 'error' | 'info') => {
  ElMessage({
    message: messageTexts[type],
    type,
    showClose: true,
  })
}
</script>
