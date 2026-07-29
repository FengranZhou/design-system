<template>
  <section id="feedback" class="demo-section">
    <h2 class="demo-section__title">Feedback 反馈组件</h2>

    <div class="demo-block">
      <p class="demo-label">警告</p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <el-alert title="成功提示" type="success" show-icon />
        <el-alert title="警告提示" type="warning" show-icon />
        <el-alert title="错误提示" type="error" show-icon />
        <el-alert title="信息提示" type="info" show-icon />
        <el-alert title="中性提示" type="info" class="alert-neutral" show-icon />
        <el-alert title="带描述的提示" type="success" description="这是一段辅助描述信息，提供更多上下文。" show-icon />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">文字提示</p>
      <div class="demo-row">
        <el-tooltip content="上方提示" placement="top">
          <el-button>上方</el-button>
        </el-tooltip>
        <el-tooltip content="右侧提示" placement="right">
          <el-button>右侧</el-button>
        </el-tooltip>
        <el-tooltip content="下方提示" placement="bottom">
          <el-button>下方</el-button>
        </el-tooltip>
        <el-tooltip content="左侧提示" placement="left">
          <el-button>左侧</el-button>
        </el-tooltip>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">弹出框</p>
      <div class="demo-row">
        <el-popover placement="bottom" :width="200" trigger="click">
          <template #reference>
            <el-button>点击弹出</el-button>
          </template>
          <p style="margin: 0; font: var(--iflyv-font-body-sub); color: var(--iflyv-text-2);">这是一段弹出框内容，用于展示 Popover 的定制效果。</p>
        </el-popover>
        <el-popover placement="bottom" :width="200" trigger="hover">
          <template #reference>
            <el-button>悬浮弹出</el-button>
          </template>
          <p style="margin: 0; font: var(--iflyv-font-body-sub); color: var(--iflyv-text-2);">悬浮触发的弹出框内容。</p>
        </el-popover>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">通知</p>
      <div class="demo-row">
        <el-button @click="showNotification('success')">成功通知</el-button>
        <el-button @click="showNotification('warning')">警告通知</el-button>
        <el-button @click="showNotification('error')">错误通知</el-button>
        <el-button @click="showNotification('info')">信息通知</el-button>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">抽屉</p>
      <div class="demo-row">
        <el-button type="primary" @click="drawerVisible = true">打开抽屉</el-button>
      </div>

      <el-drawer v-model="drawerVisible" title="抽屉标题" size="400px">
        <p style="color: var(--iflyv-text-2);">这是抽屉的内容区域，展示定制主题下的 Drawer 组件。</p>
      </el-drawer>
    </div>

    <div class="demo-block">
      <p class="demo-label">抽屉（底部水平按钮）</p>
      <div class="demo-row">
        <el-button type="primary" @click="drawerFooterVisible = true">打开抽屉</el-button>
      </div>

      <el-drawer v-model="drawerFooterVisible" title="编辑信息" size="400px">
        <p style="color: var(--iflyv-text-2);">底部按钮默认水平排列，确认按钮在右侧。</p>
        <template #footer>
          <el-button @click="drawerFooterVisible = false">取消</el-button>
          <el-button type="primary" @click="drawerFooterVisible = false">确定</el-button>
        </template>
      </el-drawer>
    </div>

    <div class="demo-block">
      <p class="demo-label">抽屉（底部垂直按钮）</p>
      <div class="demo-row">
        <el-button type="primary" @click="drawerVerticalVisible = true">打开抽屉</el-button>
      </div>

      <el-drawer v-model="drawerVerticalVisible" title="确认操作" size="400px">
        <p style="color: var(--iflyv-text-2);">底部按钮垂直排列，适用于窄抽屉等特殊场景。</p>
        <template #footer>
          <div class="drawer-footer--vertical">
            <el-button type="primary" @click="drawerVerticalVisible = false">确定</el-button>
            <el-button @click="drawerVerticalVisible = false">取消</el-button>
          </div>
        </template>
      </el-drawer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'

const drawerVisible = ref(false)
const drawerFooterVisible = ref(false)
const drawerVerticalVisible = ref(false)

const notificationTexts: Record<string, { title: string; message: string }> = {
  success: { title: '操作成功', message: '数据已成功保存到系统中。' },
  warning: { title: '注意', message: '该操作可能影响其他模块。' },
  error: { title: '操作失败', message: '网络异常，请稍后重试。' },
  info: { title: '提示', message: '系统将于今晚 22:00 进行维护。' },
}

const showNotification = (type: 'success' | 'warning' | 'error' | 'info') => {
  const { title, message } = notificationTexts[type]
  ElNotification({ title, message, type })
}
</script>
