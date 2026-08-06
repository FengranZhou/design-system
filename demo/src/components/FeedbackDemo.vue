<template>
  <section id="feedback" class="demo-section">
    <h2 class="demo-section__title">Feedback 反馈组件</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">警告</p>
        <!-- 单条实时示例：场景（语义色）× 辅助信息（带/不带描述）两个正交配置项叠加，共 5×2=10 种组合 -->
        <el-alert
          :key="alertScene.value + String(alertShowDesc)"
          :title="alertScene.title"
          :type="alertScene.type"
          :class="alertScene.class"
          :description="alertShowDesc ? alertScene.desc : undefined"
          show-icon
        />
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="alertConfigForm" label-width="auto">
          <el-form-item label="场景">
            <el-radio-group v-model="alertSceneKey">
              <el-radio v-for="s in alertScenes" :key="s.value" :value="s.value">{{ s.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="辅助信息">
            <el-switch v-model="alertShowDesc" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">文字提示</p>
        <!-- 单条实时示例：弹出方向由右侧「方向」配置项控制（:key 触发方向切换时重挂载） -->
        <div class="demo-row">
          <el-tooltip :key="tooltipPlacement" :content="tooltipContent" :placement="tooltipPlacement">
            <el-button>悬停查看提示</el-button>
          </el-tooltip>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="tooltipConfigForm" label-width="auto">
          <el-form-item label="方向">
            <el-radio-group v-model="tooltipPlacement">
              <el-radio v-for="p in tooltipPlacements" :key="p.value" :value="p.value">{{ p.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <!-- ⏸ 暂停展示：弹出框（Popover，点击/悬浮触发）。暂时不用，保留代码，需要时放开。
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
    -->



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

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">抽屉</p>
        <p class="demo-desc">适用于辅助信息展示场景，相比对话框，承载信息量更多，抽屉内信息关联度更低，任务连贯性更强，页面遮挡更少。</p>
        <!-- 单条实时示例：按钮有无 + 按钮布局作为配置项 -->
        <div class="demo-row">
          <el-button type="primary" @click="drawerVisible = true">打开抽屉</el-button>
        </div>

        <el-drawer v-model="drawerVisible" :title="drawerHasFooter ? '编辑信息' : '抽屉标题'" size="400px">
          <p style="color: var(--iflyv-text-2);">这是抽屉的内容区域。</p>
          <template v-if="drawerHasFooter" #footer>
            <div v-if="drawerFooterVertical" class="drawer-footer--vertical">
              <el-button type="primary" @click="drawerVisible = false">确定</el-button>
              <el-button @click="drawerVisible = false">取消</el-button>
            </div>
            <template v-else>
              <el-button @click="drawerVisible = false">取消</el-button>
              <el-button type="primary" @click="drawerVisible = false">确定</el-button>
            </template>
          </template>
        </el-drawer>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="drawerConfigForm" label-width="auto">
          <el-form-item label="底部按钮">
            <el-switch v-model="drawerHasFooter" />
          </el-form-item>
          <el-form-item v-if="drawerHasFooter" label="按钮垂直">
            <el-switch v-model="drawerFooterVertical" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { ElNotification, ElButton } from 'element-plus'
import type { NotificationHandle } from 'element-plus'

// —— 警告（Alert）：5 类语义场景，「场景」× 「辅助信息」两个正交配置项自由叠加（5×2=10 种组合）——
// 中性场景走约定 class .alert-neutral（EP 无中性 type，用 info 底 + 中性色覆盖，定义在源头）。
type AlertScene = {
  value: string; label: string; title: string
  type: 'success' | 'warning' | 'error' | 'info'; class?: string; desc: string
}
const alertScenes: AlertScene[] = [
  { value: 'success', label: '成功', title: '成功提示', type: 'success', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'warning', label: '警告', title: '警告提示', type: 'warning', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'error', label: '错误', title: '错误提示', type: 'error', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'info', label: '信息', title: '信息提示', type: 'info', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'neutral', label: '中性', title: '中性提示', type: 'info', class: 'alert-neutral', desc: '这是一段辅助描述信息，提供更多上下文。' },
]
const alertSceneKey = ref('success')
const alertShowDesc = ref(false)
const alertScene = computed(() => alertScenes.find(s => s.value === alertSceneKey.value)!)
const alertConfigForm = reactive({ alertSceneKey, alertShowDesc })

// —— 文字提示（Tooltip）：弹出方向作为配置项（上/右/下/左）——
const tooltipPlacements = [
  { value: 'top', label: '上方' },
  { value: 'right', label: '右侧' },
  { value: 'bottom', label: '下方' },
  { value: 'left', label: '左侧' },
] as const
const tooltipPlacement = ref<'top' | 'right' | 'bottom' | 'left'>('top')
const tooltipContent = '这是一段文字提示内容'
const tooltipConfigForm = reactive({ tooltipPlacement })

// —— 抽屉（Drawer）：底部按钮有无 + 按钮布局（水平/垂直）作为配置项 ——
const drawerVisible = ref(false)
const drawerHasFooter = ref(false)          // 是否显示底部按钮
const drawerFooterVertical = ref(false)     // 底部按钮是否垂直排列
const drawerConfigForm = reactive({ drawerHasFooter, drawerFooterVertical })

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
/* 每个 demo 块用 bg-card 大卡片做区分（与 Dialog / Select / Input 各 demo 一致，本页排版走令牌）。
   卡间垂直间距统一 24（spacing-6）；覆盖全局 .demo-block 自带的 48px margin，避免叠加。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.demo-section .demo-block + .demo-block {
  margin-top: var(--iflyv-spacing-6);
}

/* 配置式布局：左示例 + 右配置卡横向（与 Dialog / Input / Navigation 配置式范式一致，纯本页排版，不含组件外观） */
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
