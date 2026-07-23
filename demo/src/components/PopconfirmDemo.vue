<template>
  <section id="popconfirm" class="demo-section">
    <h2 class="demo-section__title">Popconfirm 气泡确认框</h2>

    <div class="demo-block">
      <p class="demo-label">气泡确认</p>
      <div class="demo-row">
        <el-popconfirm
        title="确定要删除这条记录吗？"
        confirm-button-text="确认删除"
        cancel-button-text="取消"
        @confirm="onConfirm"
      >
        <template #reference>
          <el-button type="danger">删除记录</el-button>
        </template>
      </el-popconfirm>

      <el-popconfirm
        title="确定要提交审核吗？"
        confirm-button-text="提交"
        cancel-button-text="再想想"
        @confirm="onConfirm"
      >
        <template #reference>
          <el-button type="primary">提交审核</el-button>
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
