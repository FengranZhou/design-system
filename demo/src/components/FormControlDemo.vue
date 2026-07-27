<template>
  <section id="form-control" class="demo-section">
    <h2 class="demo-section__title">FormControl 表单控件</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">基础单选</p>
        <p class="demo-desc">与 select 相比，Radio 所有选项默认可见，方便用户在比较中选择，选项数需 ≤5</p>
        <!-- 两个 el-radio-group 是单选状态约束所需（一组正常单选、一组展示禁用/选中禁用）；
             用 radio-inline-row 让两组的四个 radio 视觉上连续等距排列，与 Checkbox 一致 -->
        <div class="demo-row radio-inline-row">
          <el-radio-group v-model="radioValue">
            <el-radio value="1">{{ radioShowText ? '未选' : '' }}</el-radio>
            <el-radio value="2">{{ radioShowText ? '选中' : '' }}</el-radio>
          </el-radio-group>
          <el-radio-group :model-value="'on'">
            <el-radio value="off" disabled>{{ radioShowText ? '禁用' : '' }}</el-radio>
            <el-radio value="on" disabled>{{ radioShowText ? '选中禁用' : '' }}</el-radio>
          </el-radio-group>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="radioConfigForm" label-width="auto">
          <el-form-item label="文字">
            <el-switch v-model="radioShowText" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block">
      <p class="demo-label">单选按钮组</p>
      <p class="demo-desc">以切换按钮形式呈现</p>
      <div class="demo-row" style="gap: 30px">
        <el-radio-group v-model="radioButtonValue">
          <el-radio-button value="left">左对齐</el-radio-button>
          <el-radio-button value="center">居中</el-radio-button>
          <el-radio-button value="right">右对齐</el-radio-button>
        </el-radio-group>
        <el-radio-group :model-value="'on'">
          <el-radio-button value="off" disabled>禁用</el-radio-button>
          <el-radio-button value="off2" disabled>禁用</el-radio-button>
          <el-radio-button value="on" disabled>选中禁用</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">Checkbox 多选</p>
        <!-- checkbox-inline-row：让 group 内两项与后面四个独立项在 flex 里成为平级等距子项
             （group 盒子 display:contents 透明化，与 radio-inline-row 同一手法，纯排版不碰组件外观） -->
        <div class="demo-row checkbox-inline-row">
          <!-- 状态清单顺序：选中 / 未选 / 半选 / 禁用 / 选中禁用 / 半选禁用
               （三个常态在前、三个禁用态在后）。仅「选中」「未选」两个可交互项进 group 的 v-model；
               半选、禁用、选中禁用、半选禁用均为纯状态展示（indeterminate / disabled 直接置位，不进 group）。 -->
          <el-checkbox-group v-model="checkboxValue">
            <el-checkbox :label="checkboxShowText ? '选中' : ''" value="vue" />
            <el-checkbox :label="checkboxShowText ? '未选' : ''" value="react" />
          </el-checkbox-group>
          <el-checkbox :indeterminate="true" :label="checkboxShowText ? '半选' : ''" />
          <el-checkbox :model-value="false" disabled :label="checkboxShowText ? '禁用' : ''" />
          <el-checkbox :model-value="true" disabled :label="checkboxShowText ? '选中禁用' : ''" />
          <el-checkbox :indeterminate="true" disabled :label="checkboxShowText ? '半选禁用' : ''" />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="checkboxConfigForm" label-width="auto">
          <el-form-item label="文字">
            <el-switch v-model="checkboxShowText" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">Switch 开关</p>
        <!-- 文字开关切换 switch 右侧文字标签是否显示；关闭（默认）则只留开关本体。
             文字统一显示在开关右侧（active-text，EP 默认渲染在右），随开关状态取色（开=主色、禁用=灰）。
             文字内容为各自的状态名：开关 / 关闭禁用 / 开启禁用。 -->
        <div class="demo-row">
          <el-switch
            v-model="switchValue1"
            :active-text="switchShowText ? '开关' : undefined"
          />
          <el-switch
            disabled :model-value="false"
            :active-text="switchShowText ? '关闭禁用' : undefined"
          />
          <el-switch
            disabled :model-value="true"
            :active-text="switchShowText ? '开启禁用' : undefined"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="switchConfigForm" label-width="auto">
          <el-form-item label="文字">
            <el-switch v-model="switchShowText" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block">
      <p class="demo-label">Slider 滑块</p>
      <div style="width: 400px">
        <el-slider v-model="sliderValue" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Rate 评分</p>
      <div class="demo-row">
        <el-rate v-model="rateValue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const radioValue = ref('2')
const radioButtonValue = ref('center')
const checkboxValue = ref(['vue'])
const switchValue1 = ref(true)
const sliderValue = ref(30)
const rateValue = ref(3)

// Radio / Checkbox 各自独立配置卡：文字是否显示（关闭则只留选择控件本体）
const radioShowText = ref(true)
const radioConfigForm = reactive({ radioShowText })
const checkboxShowText = ref(true)
const checkboxConfigForm = reactive({ checkboxShowText })
// Switch 文字：默认关闭（不展示 active-text / inactive-text），开启则显示「开 / 关」
const switchShowText = ref(false)
const switchConfigForm = reactive({ switchShowText })
</script>

<style scoped>
/* 纯本页排版：左示例 + 右配置卡横向布局，与 Button / Empty / Input 配置式范式一致。 */

/* 每个 demo 块用 bg-card 大卡片做区分（本页排版，走令牌）。
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
  flex: 0 1 auto;
  width: 220px;
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

/* Radio 四项连续等距：两个 el-radio-group 盒子用 display:contents 透明化，
   四个 el-radio 直接成为 .demo-row(flex) 的子项，与 Checkbox 一行等距一致。
   保留两个 group 是单选状态约束（一组正常单选、一组禁用/选中禁用）所必需。 */
.radio-inline-row {
  gap: 30px;
}
.radio-inline-row :deep(.el-radio-group) {
  display: contents;
}
/* 抹掉 EP el-radio 默认的 margin-right(30px)，间距统一交给 .demo-row 的 gap 管，避免叠加 */
.radio-inline-row :deep(.el-radio) {
  margin-right: 0;
}

/* Checkbox 六态平级等距：group 盒子 display:contents 透明化，让「选中/未选」两项与后面
   四个独立展示项都成为 .demo-row(flex) 的直接子项，六个平级等距（与 radio-inline-row 同手法）。 */
.checkbox-inline-row :deep(.el-checkbox-group) {
  display: contents;
}
/* 抹掉源头 el-checkbox 的 margin-inline-end(16px)，间距统一交给 .demo-row 的 gap 管，避免叠加 */
.checkbox-inline-row :deep(.el-checkbox) {
  margin-inline-end: 0;
}
</style>
