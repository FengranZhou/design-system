<template>
  <section id="dialog" class="demo-section">
    <h2 class="demo-section__title">Dialog 对话框</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">操作弹窗</p>
        <p class="demo-desc">操作弹窗主要用于在弹窗内进行表单填写等操作行为的载体，适用于承载信息量更少、信息关联度更高、任务连贯性更弱、页面遮挡更多的场景。</p>
        <div class="demo-row">
          <el-button type="primary" @click="dialogVisible = true">打开操作弹窗</el-button>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="dialogConfigForm" label-width="auto">
          <el-form-item label="场景">
            <el-radio-group v-model="dialogScene">
              <el-radio v-for="s in dialogScenes" :key="s.value" :value="s.value">{{ s.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="提示信息">
            <el-switch v-model="dialogShowTip" />
          </el-form-item>
          <el-form-item label="多标题">
            <el-switch v-model="dialogMultiTitle" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">提示弹窗</p>
        <p class="demo-desc">提示弹窗主要用于传达系统给用户的提醒，需要打断用户，信息常常较为重要。</p>
        <div class="demo-row">
          <el-button @click="tipVisible = true">打开提示弹窗</el-button>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="tipConfigForm" label-width="auto">
          <el-form-item label="场景">
            <el-radio-group v-model="tipScene">
              <el-radio v-for="s in tipScenes" :key="s.value" :value="s.value">{{ s.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <!-- 基础 -->
    <el-dialog v-model="dialogVisible" class="demo-dialog-basic" title="弹窗标题" :width="dialogSceneWidth">
      <!-- 多标题：开启时用 #header 插槽放一组可点击标题（约定 class 见 dialog.scss），点击切换 activeTitle -->
      <template v-if="dialogMultiTitle" #header>
        <div class="dialog-titles">
          <span
            v-for="(t, i) in dialogTitles"
            :key="t"
            class="dialog-title-item"
            :class="{ 'is-active': activeTitle === i }"
            @click="activeTitle = i"
          >{{ t }}</span>
        </div>
      </template>
      <!-- 提示信息条：约定放在 content 区顶部（header 之下、主内容之上），中性灰底 alert 承载一句引导/说明文案。 -->
      <el-alert
        v-if="dialogShowTip"
        class="alert-neutral"
        type="info"
        :closable="false"
        title="提示信息"
      />
      <!-- content 区：header 与 footer 之间的内容填充区。后续用此弹窗时，业务内容都放在这块区域内。 -->
      <div class="dialog-content-slot">内容区域</div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确认</el-button>
      </template>
    </el-dialog>

    <!-- 提示弹窗：四类语义（警告/危险/成功/信息）由「场景」配置驱动，class / 标题 / 正文 / 按钮组合随场景切换。
         按钮个数遵循规范：成功=纯告知单钮；其余=一退路+一进路两钮（见 component-interaction.md「按钮个数」）。 -->
    <el-dialog v-model="tipVisible" :class="activeTip.class" :title="activeTip.title" width="400px">
      <p>{{ activeTip.body }}</p>
      <template #footer>
        <el-button
          v-for="btn in activeTip.buttons"
          :key="btn.label"
          :type="btn.type"
          @click="tipVisible = false"
        >{{ btn.label }}</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const dialogVisible = ref(false)
// 对话框宽度按「场景」选（不直接暴露宽度数值）：确认/单字段=400、常规表单=640、复杂/双列=800。
// 与 references/component-interaction.md 的 Dialog 宽度规范一致——下游也应从这三档场景里选。
const dialogScenes = [
  { value: 'confirm', label: '确认/单字段', width: '400px' },
  { value: 'form', label: '常规表单', width: '640px' },
  { value: 'complex', label: '复杂/双列', width: '800px' },
]
const dialogScene = ref('confirm')
const dialogSceneWidth = computed(() => dialogScenes.find(s => s.value === dialogScene.value)!.width)
// 提示信息条：约定放在弹窗内容区顶部，中性灰底 alert 承载引导/说明文案
const dialogShowTip = ref(false)
// 多标题：头部渲染一组可点击标题，activeTitle 记录当前选中项
const dialogMultiTitle = ref(false)
const dialogTitles = ['标题一', '标题二', '标题三']
const activeTitle = ref(0)
const dialogConfigForm = reactive({ dialogScene, dialogShowTip, dialogMultiTitle })

// —— 提示弹窗：四类语义场景（警告/危险/成功/信息）由「场景」配置驱动 ——
// 每个场景一份配置：变体 class + 标题 + 正文 + footer 按钮组合。
// 按钮个数遵循 component-interaction.md「按钮个数」：成功=纯告知单钮；其余=一退路+一进路两钮。
const tipVisible = ref(false)
type TipScene = {
  value: string; label: string; class: string; title: string; body: string
  buttons: { label: string; type?: 'primary' | 'danger' }[]
}
const tipScenes: TipScene[] = [
  {
    value: 'warning', label: '警告', class: 'is-warning',
    title: '离开未保存页面', body: '当前页有 3 处修改未保存，离开后将丢失。',
    buttons: [{ label: '取消' }, { label: '保存并离开', type: 'primary' }],
  },
  {
    value: 'danger', label: '危险', class: 'is-danger',
    title: '删除用户「张三」', body: '此操作不可撤销，张三的所有数据将被永久删除。',
    buttons: [{ label: '取消' }, { label: '确认删除', type: 'danger' }],
  },
  {
    value: 'success', label: '成功', class: 'is-success',
    title: '操作完成', body: '批量启用已成功完成，共影响 32 条数据。',
    buttons: [{ label: '知道了', type: 'primary' }],
  },
  {
    value: 'info', label: '信息', class: 'is-info',
    title: '新版本可用', body: 'v0.5.0 已发布，包含若干 bug 修复和新功能，建议更新。',
    buttons: [{ label: '稍后' }, { label: '立即更新', type: 'primary' }],
  },
]
const tipScene = ref('warning')
const tipConfigForm = reactive({ tipScene })
const activeTip = computed(() => tipScenes.find(s => s.value === tipScene.value)!)
</script>

<style scoped>
/* 每个 demo 块用 bg-card 大卡片做区分（与 Select / Input / Navigation 一致，本页排版走令牌）。
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

/* 提示信息条的下边距已归源头 dialog.scss（.el-dialog__body > .el-alert:first-child），此处不再定义。 */

/* 基础对话框 demo 的默认展示高度 360px（纯本 demo 排版：撑起弹窗便于观察内容区，非组件外观规则）。
   弹窗高度由内容自然撑开，故直接给内容占位块定高至整体达 360。 */
.demo-dialog-basic .dialog-content-slot {
  min-height: 176px;
}

/* 基础对话框的 content 占位区（纯本 demo 示意骨架）：brand-bg 底色，示意「后续弹窗内容都填这块区域」。
   非组件外观，走令牌：品牌浅底 + 圆角 + 内边距 + 次要文字色，居中提示。 */
.dialog-content-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-brand-bg);
  border-radius: var(--iflyv-radius-md);
  color: var(--iflyv-brand-text);
  /* body-sub 字体族含空格字体名，不能用 font: 简写，拆分属性逐条设 */
  font-size: var(--iflyv-font-size-14);
  line-height: var(--iflyv-line-height-20);
  font-weight: var(--iflyv-font-weight-regular);
}

/* 配置式布局：左示例 + 右配置卡横向（与 Input / Navigation 配置式范式一致，纯本页排版，不含组件外观） */
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

/* 配置卡：白底 + 细边框区分层次（与其它 demo 一致） */
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
</style>
