<template>
  <section id="popconfirm" class="demo-section">
    <h2 class="demo-section__title">Popconfirm 气泡确认框</h2>

    <div class="demo-block">
      <p class="demo-desc">目标元素的操作需要用户进一步完成交互形式更轻量的确认时使用。</p>
      <div class="demo-row">
        <el-popconfirm
          title="确定要删除这条记录吗？"
          confirm-button-text="删除"
          confirm-button-type="danger"
          cancel-button-text="取消"
          @confirm="onConfirm"
        >
          <template #reference>
            <el-button type="danger">删除记录</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'

const onConfirm = () => {
  ElMessage.success('操作已确认')
}
</script>
