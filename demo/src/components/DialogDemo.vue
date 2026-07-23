<template>
  <section id="dialog" class="demo-section">
    <h2 class="demo-section__title">Dialog 对话框</h2>

    <div class="demo-block">
      <p class="demo-label">基础对话框</p>
      <div class="demo-row">
        <el-button type="primary" @click="dialogVisible = true">打开对话框</el-button>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">语义化标题（warning / danger / success / info）</p>
      <div class="demo-row">
        <el-button @click="warningVisible = true">Warning 警告</el-button>
        <el-button type="danger" @click="dangerVisible = true">Danger 危险</el-button>
        <el-button @click="successVisible = true">Success 成功</el-button>
        <el-button @click="infoVisible = true">Info 信息</el-button>
      </div>
    </div>

    <!-- 基础 -->
    <el-dialog v-model="dialogVisible" title="对话框标题" width="400px">
      <p>这是一段对话框内容，用于展示定制主题下的 Dialog 组件效果。</p>
      <p style="margin-top: 12px; color: var(--iflyv-text-3);">对话框已去除分割线，使用 12px 圆角，底部按钮右对齐。</p>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确认</el-button>
      </template>
    </el-dialog>

    <!-- Warning -->
    <el-dialog v-model="warningVisible" class="is-warning" title="离开未保存页面" width="400px">
      <p>当前页有 3 处修改未保存。</p>
      <p style="margin-top: 8px; color: var(--iflyv-text-3); font-size: 13px;">离开后这些修改将丢失，建议先保存再离开。</p>
      <template #footer>
        <el-button @click="warningVisible = false">取消</el-button>
        <el-button type="primary" @click="warningVisible = false">保存并离开</el-button>
      </template>
    </el-dialog>

    <!-- Danger -->
    <el-dialog v-model="dangerVisible" class="is-danger" title="删除用户「张三」" width="400px">
      <p>此操作不可撤销，张三的所有数据将被永久删除。</p>
      <p style="margin-top: 8px; color: var(--iflyv-text-3); font-size: 13px;">关联的 12 条订单、5 条评论将一并清除。</p>
      <template #footer>
        <el-button @click="dangerVisible = false">取消</el-button>
        <el-button type="danger" @click="dangerVisible = false">确认删除</el-button>
      </template>
    </el-dialog>

    <!-- Success -->
    <el-dialog v-model="successVisible" class="is-success" title="操作完成" width="400px">
      <p>批量启用已成功完成，共影响 32 条数据。</p>
      <template #footer>
        <el-button type="primary" @click="successVisible = false">知道了</el-button>
      </template>
    </el-dialog>

    <!-- Info -->
    <el-dialog v-model="infoVisible" class="is-info" title="新版本可用" width="400px">
      <p>v0.5.0 已发布，包含若干 bug 修复和新功能。</p>
      <p style="margin-top: 8px; color: var(--iflyv-text-3); font-size: 13px;">建议更新到最新版本以获得最佳体验。</p>
      <template #footer>
        <el-button @click="infoVisible = false">稍后</el-button>
        <el-button type="primary" @click="infoVisible = false">立即更新</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dialogVisible = ref(false)
const warningVisible = ref(false)
const dangerVisible = ref(false)
const successVisible = ref(false)
const infoVisible = ref(false)
</script>
