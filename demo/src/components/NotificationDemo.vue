<template>
  <section id="notification" class="demo-section">
    <h2 class="demo-section__title">Notification 通知</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">通知</p>
        <p class="demo-desc">适用于较长时间的结果通知，期间用户不必停留等待，可进行其他操作。</p>
        <div class="demo-row">
          <el-button @click="showNotification">打开通知</el-button>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="notifyConfigForm" label-width="auto">
          <el-form-item label="场景">
            <el-radio-group v-model="notifyScene">
              <el-radio v-for="s in notifyScenes" :key="s.value" :value="s.value">{{ s.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否常驻">
            <div class="config-field">
              <!-- switch 套与 label 等高的居中行，使其与 label 垂直居中对齐（与 Select 配置卡一致） -->
              <div class="config-field__row">
                <el-switch v-model="notifyPersist" />
              </div>
              <p class="config-card__hint">{{ notifyPersist ? '默认常驻' : '非必要不临时' }}</p>
            </div>
          </el-form-item>
          <el-form-item label="操作按钮">
            <el-switch v-model="notifyActions" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { ElNotification, ElButton } from 'element-plus'
import type { NotificationHandle } from 'element-plus'

// —— 通知（Notification）：「场景」× 「是否常驻」× 「操作按钮」三个正交配置项自由叠加 ——
type NotifyScene = {
  value: string; label: string; title: string; message: string
  type: 'success' | 'warning' | 'error' | 'info'
}
const notifyScenes: NotifyScene[] = [
  { value: 'success', label: '成功', title: '操作成功', message: '数据已成功保存到系统中。', type: 'success' },
  { value: 'warning', label: '警告', title: '注意', message: '该操作可能影响其他模块。', type: 'warning' },
  { value: 'error', label: '错误', title: '操作失败', message: '网络异常，请稍后重试。', type: 'error' },
  { value: 'info', label: '信息', title: '提示', message: '系统将于今晚 22:00 进行维护。', type: 'info' },
]
const notifyScene = ref('success')
const notifyPersist = ref(false)   // duration=0 常驻不自动关闭
const notifyActions = ref(false)   // 通知内嵌一次按钮 + 一主按钮
const notifyConfigForm = reactive({ notifyScene, notifyPersist, notifyActions })

const showNotification = () => {
  const s = notifyScenes.find(n => n.value === notifyScene.value)!
  // 操作按钮开启时：正文下方一行放「一退路(次按钮) + 一进路(主按钮)」，走 h() 渲染 VNode 作 message
  // （EP Notification 无 footer/按钮 prop，操作按钮须以 VNode 塞进 message，见 component-interaction.md）
  let handle: NotificationHandle
  const message = notifyActions.value
    ? h('div', [
        h('p', { style: 'margin: 0;' }, s.message),
        // 操作按钮行走源头约定 class .notify-actions（右对齐 / 上间距 / 按钮间距 / 对齐关闭图标 全在 notification.scss）
        h('div', { class: 'notify-actions' }, [
          h(ElButton, { size: 'small', onClick: () => handle?.close() }, () => '忽略'),
          h(ElButton, { size: 'small', type: 'primary', onClick: () => handle?.close() }, () => '查看详情'),
        ]),
      ])
    : s.message
  handle = ElNotification({
    title: s.title,
    message,
    type: s.type,
    duration: notifyPersist.value ? 0 : 4500,
  })
}
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Dialog / Select / Input 各 demo 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}

/* 配置式布局：左示例 + 右配置卡横向（与 Dialog / Input 配置式范式一致，纯本页排版，不含组件外观） */
.control-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.control-showcase__main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .control-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}

.config-card {
  flex: 0 0 auto;
  width: 400px;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}

/* 开关 + 下方随开关变化的说明小字（与 Select 配置卡同款竖排结构，纯本页排版走令牌） */
.config-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
/* switch 行：与 label 等高（组件统一高度）并垂直居中，使 switch 与 label 中线对齐 */
.config-field__row {
  display: flex;
  align-items: center;
  height: var(--el-component-size);
}
/* 说明小字：浅色小字，紧跟开关下方（上距 4px） */
.config-card__hint {
  margin: var(--iflyv-spacing-1) 0 0;
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
</style>
