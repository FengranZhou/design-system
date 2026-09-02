<!--
  OptionCard 卡片单选（业务组件层）

  ▶ 是什么：从一组固定选项里**选一个**，每个选项呈现为一块**带图标的卡片**——
    白底、实线描边、圆角；选中时描边与文字转品牌色。选项在容器内按网格铺开。
    典型：题型选择、模板选择、场景选择……凡是「选项自带图形标识、需要并排比较」的单选。

  ▶ 为什么不是 el-radio / el-radio-button（本组件存在的理由）：
    - `el-radio` 是「圆点 + 文字」，选项自带的图标没有承载位置，硬塞进 label 会让圆点与图标并列、语义拥挤；
    - `el-radio-button` 是**首尾相连的分段条**（共享边框、无间隙），且 select-pattern 已表态
      「一般不默认使用」——它解决的是紧凑切换，不是并排比较的卡片块。
    本组件是「每块独立成卡、可换行成网格」的第三种形态，与上述两者职责不同。
    ⚠ 仍是**单选**：一次只有一项被选中。要多选请用 `el-checkbox-group`（标准勾选框形态）。

  ▶ 排布：**按 `columns` 列等分填充容器**（默认 3 列），选项多于列数时自动折行。
    卡片宽度不写死——容器宽则卡片宽，始终铺满，不留右侧空档。

  ▶ **再次点击已选中项 = 取消选中**，v-model 回到空串 `''`。
    单选场景里"选错了想清空"很常见，没有这条用户只能改选别项、退不回未选状态。
    ⚠ 该字段若是必填，取消后表单校验会正常报"未选择"——这是预期行为。

  接入方速查：
    基础：  <OptionCard v-model="type" :options="[{ label: '单选题', value: 'single', icon: iconSingle }]" />
    列数：  <OptionCard v-model="type" :options="opts" :columns="2" />
    表单里：<el-form-item label="题型" prop="type">
              <OptionCard v-model="form.type" :options="QUESTION_TYPES" />
            </el-form-item>
    图标可选：不传 icon 时只显示文字，卡片仍居中排布。
    禁用项：  选项对象加 disabled: true。

  外观（全在本组件源头，接入方无需关心，也不要在使用方 scoped 覆盖）：
    白底 bg-panel + border-default 描边 + radius-sm；文字 body-sub / text-1；
    图标与文字水平间距 spacing-1（4）；
    选中：只有描边转 brand-primary，底与文字均不变（选中由描边指示，同 radio 的口径）；
    hover：仅未选中项描边转 border-strong（选中项 hover 保持品牌色描边）；
    禁用：文字 text-4、描边 subtle、图标 opacity .3、不可点。
-->
<template>
  <div class="option-card-group" :style="{ '--option-card-columns': columns }">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="option-card"
      :class="{ 'is-active': modelValue === opt.value, 'is-disabled': opt.disabled }"
      :disabled="opt.disabled"
      :aria-pressed="modelValue === opt.value"
      @click="onPick(opt)"
    >
      <img v-if="opt.icon" class="option-card__icon" :src="opt.icon" alt="" />
      <span class="option-card__label">{{ opt.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { OptionCardItem } from './types'

/**
 * OptionCard 卡片单选（通用业务组件）
 * @prop modelValue 当前选中项的 value
 * @prop options    选项列表：{ label, value, icon?, disabled? }
 * @prop columns    每行列数，默认 3；卡片按列等分填充容器，超出自动折行
 * @event update:modelValue 选中项变化
 */
const props = withDefaults(
  defineProps<{
    modelValue: string | number
    options: OptionCardItem[]
    columns?: number
  }>(),
  { columns: 3 },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

// 再次点击已选中项即取消选中（值回到空串）——单选场景里"选错了想清空"
// 是常见诉求，否则用户只能改选别项、无法退回未选状态
const onPick = (opt: OptionCardItem) => {
  if (opt.disabled) return
  emit('update:modelValue', props.modelValue === opt.value ? '' : opt.value)
}
</script>

<style scoped>
/* 自己的骨架：按 columns 列等分填充容器，选项多于列数时自动折到下一行
   （grid 天然折行，无需 flex-wrap）；卡片间距走「列表项之间」 */
.option-card-group {
  display: grid;
  grid-template-columns: repeat(var(--option-card-columns), 1fr);
  gap: var(--iflyv-spacing-3);
  width: 100%;
}

/* 单块卡片：裸 button 去掉浏览器默认样式；
   宽度由所在列等分决定，不写死；高度取控件基准高，与同表单内的输入框气质一致 */
.option-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--iflyv-spacing-1);
  min-width: 0;
  height: var(--el-component-size);
  padding: 0 var(--iflyv-spacing-3);
  border: 1px solid var(--iflyv-border-default);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-bg-panel);
  box-sizing: border-box;
  cursor: pointer;
  transition:
    border-color var(--iflyv-duration-fast) var(--iflyv-ease-default),
    color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}

/* hover 只作用于「未选中且可点」的卡片——选中项 hover 时保持品牌色描边，
   否则鼠标一悬停绿边就被灰边盖掉、看起来像掉了选中态 */
.option-card:hover:not(.is-disabled):not(.is-active) {
  border-color: var(--iflyv-border-strong);
}

/* 选中态：只换描边为品牌色，底与文字都不变——选中由描边指示即可
   （同 radio.scss「选中由圆点指示，文字不变色」的口径），也避免大面积绿（设计原则 3） */
.option-card.is-active {
  border-color: var(--iflyv-brand-primary);
}

.option-card.is-disabled {
  cursor: not-allowed;
  border-color: var(--iflyv-border-subtle);
}
.option-card.is-disabled .option-card__label {
  color: var(--iflyv-text-4);
}
/* 禁用态图标：整体降透明度（图标是彩色切图，无法像文字那样换色阶） */
.option-card.is-disabled .option-card__icon {
  opacity: 0.3;
}

.option-card__icon {
  width: 20px;
  height: 20px;
  flex: none;
}

.option-card__label {
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
