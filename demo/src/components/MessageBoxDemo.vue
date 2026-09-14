<template>
  <section id="message-box" class="demo-section">
    <h2 class="demo-section__title">MessageBox 提示确认框
      <CopyToCC anchor="message-box" :values="configForm" />
    </h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">提示确认框</p>
        <p class="demo-desc">
          命令式调起的提示弹窗，用于需要用户当场做决定的场景（删除确认、离开前确认）。
          观感与「Dialog 提示弹窗」完全一致——同一套圆角、宽度、标题字阶与语义图标，
          区别只在调用方式：这里一行代码调起、结果用 then / catch 接。
        </p>
        <div class="demo-row">
          <el-button @click="openConfirm">删除确认</el-button>
          <el-button @click="openAlert">仅告知</el-button>
          <el-button @click="openPrompt">要求输入</el-button>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="语义">
            <el-radio-group v-model="scene">
              <el-radio v-for="s in scenes" :key="s.value" :value="s.value">{{ s.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="可关闭">
            <el-switch v-model="showClose" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * MessageBox 展示页。本页只调用组件、不写任何组件外观——
 * 全部观感来自源头 el-theme/components/message-box.scss（对齐 dialog.scss 的提示弹窗形态）。
 */
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CopyToCC from './CopyToCC.vue'

// 四种语义与 Dialog 的四个变体类一一对应（见 message-box.scss 的对账清单）
const scenes = [
  { value: 'error', label: '危险' },
  { value: 'warning', label: '警告' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
] as const
type Scene = (typeof scenes)[number]['value']

const scene = ref<Scene>('error')
const showClose = ref(true)

// 供 CopyToCC 把配置卡的值带进复制出的骨架（字段名需与 catalog 的配置项对齐）
const configForm = computed(() => ({ scene: scene.value, showClose: showClose.value }))

// 主按钮语义档：仅 error(≡is-danger) 用 danger，其余三类用 primary。
// 依据 component-interaction.md:1236——变体类与主按钮 type 必须匹配语义，
// 「警告色标题 + 危险色按钮」会让用户误判操作危险性。
// EP 的 MessageBox 没有 confirmButtonType，只能通过 confirmButtonClass 传 el-button 的类。
const confirmButtonClass = computed(() =>
  scene.value === 'error' ? 'el-button--danger' : 'el-button--primary',
)

// 各语义下的示例文案：确认类要说清后果，故文案随语义走
const texts: Record<Scene, { title: string; message: string; confirm: string }> = {
  error: { title: '删除确认', message: '删除后不可恢复，确认删除？', confirm: '删除' },
  warning: { title: '离开确认', message: '当前内容尚未保存，离开将丢失改动。', confirm: '仍要离开' },
  success: { title: '发布成功', message: '课程已发布，学生现在可以看到它了。', confirm: '知道了' },
  info: { title: '同步说明', message: '数据每 10 分钟同步一次，稍后即可看到最新结果。', confirm: '好' },
}

const openConfirm = () => {
  const t = texts[scene.value]
  ElMessageBox.confirm(t.message, t.title, {
    type: scene.value,
    confirmButtonText: t.confirm,
    confirmButtonClass: confirmButtonClass.value,
    cancelButtonText: '取消',
    showClose: showClose.value,
  })
    .then(() => ElMessage({ message: '已确认', type: 'success', showClose: true }))
    // catch 接的是「取消 / 关闭」，不是错误——不接会抛未捕获的 rejection
    .catch(() => ElMessage({ message: '已取消', type: 'info', showClose: true }))
}

const openAlert = () => {
  const t = texts[scene.value]
  ElMessageBox.alert(t.message, t.title, {
    type: scene.value,
    confirmButtonText: '知道了',
    confirmButtonClass: confirmButtonClass.value,
    showClose: showClose.value,
  }).catch(() => { /* 点关闭按钮走 reject，仅告知场景无需处理 */ })
}

const openPrompt = () => {
  ElMessageBox.prompt('请输入课程名称以确认归档操作', '归档确认', {
    type: scene.value,
    confirmButtonText: '归档',
    confirmButtonClass: confirmButtonClass.value,
    cancelButtonText: '取消',
    showClose: showClose.value,
    inputPlaceholder: '请输入课程名称',
    // 校验不通过时错误文案显示在输入框下方（同 form-pattern 的报错位置约定）
    inputValidator: (v: string) => (v?.trim() ? true : '课程名称不能为空'),
  })
    .then(({ value }) => ElMessage({ message: `已归档：${value}`, type: 'success', showClose: true }))
    .catch(() => ElMessage({ message: '已取消', type: 'info', showClose: true }))
}
</script>
