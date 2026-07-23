<template>
  <section id="empty" class="demo-section">
    <h2 class="demo-section__title">Empty 空状态</h2>

    <div class="demo-block">
      <p class="demo-label">圆角矩形 + Lucide Icon（#image 插槽）</p>
      <el-empty description="暂无数据">
        <template #image>
          <div class="empty-icon-plate">
            <Inbox :size="24" :stroke-width="2" />
          </div>
        </template>
      </el-empty>
    </div>

    <div class="demo-block">
      <p class="demo-label">圆角矩形 + 不同图标</p>
      <div class="demo-row" style="gap: 48px;">
        <el-empty description="暂无文件">
          <template #image>
            <div class="empty-icon-plate">
              <FolderOpen :size="24" :stroke-width="2" />
            </div>
          </template>
        </el-empty>
        <el-empty description="暂无搜索结果">
          <template #image>
            <div class="empty-icon-plate">
              <FileSearch :size="24" :stroke-width="2" />
            </div>
          </template>
        </el-empty>
        <el-empty description="暂无消息">
          <template #image>
            <div class="empty-icon-plate">
              <MessageSquare :size="24" :stroke-width="2" />
            </div>
          </template>
        </el-empty>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">带操作按钮</p>
      <div class="demo-row" style="gap: 48px;">
        <el-empty description="暂无数据">
          <template #image>
            <div class="empty-icon-plate">
              <Inbox :size="24" :stroke-width="2" />
            </div>
          </template>
          <el-button>立即创建</el-button>
        </el-empty>
        <el-empty description="暂无搜索结果">
          <template #image>
            <div class="empty-icon-plate">
              <FileSearch :size="24" :stroke-width="2" />
            </div>
          </template>
          <el-button>清空筛选</el-button>
        </el-empty>
        <el-empty description="加载失败，请稍后重试">
          <template #image>
            <div class="empty-icon-plate">
              <AlertCircle :size="24" :stroke-width="2" />
            </div>
          </template>
          <el-button>重新加载</el-button>
        </el-empty>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Inbox, FolderOpen, FileSearch, MessageSquare, AlertCircle } from 'lucide-vue-next'
</script>
