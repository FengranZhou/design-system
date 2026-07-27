<template>
  <section id="upload" class="demo-section">
    <h2 class="demo-section__title">Upload 上传</h2>

    <!-- ⏸ 暂停启用：基础「Upload 上传」（点击选择文件）。暂时用不到，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">Upload 上传</p>
      <div class="demo-row">
        <el-upload action="#" :auto-upload="false" :limit="3">
          <el-button type="primary">
            <template #icon><Upload :size="16" :stroke-width="2" /></template>
            选择文件
          </el-button>
          <template #tip>
            <div style="color: var(--iflyv-text-3); font: var(--iflyv-font-body-min); margin-top: 8px;">
              支持 jpg/png 文件，单个不超过 2MB
            </div>
          </template>
        </el-upload>
      </div>
    </div>
    -->

    <div class="demo-block">
      <p class="demo-label">拖拽上传</p>
      <div class="demo-row">
        <el-upload action="#" :auto-upload="false" drag style="width: 400px;">
          <div style="padding: 20px 0;">
            <Upload :size="32" :stroke-width="2" style="color: var(--iflyv-text-4);" />
            <div style="color: var(--iflyv-text-3); margin-top: 8px;">将文件拖到此处，或<span style="color: var(--iflyv-brand-primary);">点击上传</span></div>
          </div>
        </el-upload>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Upload } from 'lucide-vue-next'
</script>
