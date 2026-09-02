<!--
  PickedItem 已选项（业务组件层）

  ▶ 是什么：表单里「已经选中的一个值」的可视化块——白底、实线描边、右侧可删除。
    典型：知识点、出题范围、标签、参与人、适用班级……凡是「从别处挑进来、可逐个删掉」的值。

  ▶ ⛔ 不要用 el-tag 代替（本组件存在的理由）：
    Tag 的语义是**状态 / 分类的只读标识**（进行中、已完成、AI），它不是表单控件、不参与提交；
    本组件是**表单字段的已选值**，可增可删、参与提交。两者职责不同，观感也不同
    （Tag 是彩色胶囊，本组件是白底方块，与同排的输入框、增加入口等高对齐）。
    真实翻车：AI 出题页的「知识点」曾用 el-tag closable 实现——形似而语义错，
    且蓝底胶囊与旁边的方块入口高矮不齐。

  ▶ 与「增加入口」的关系：本组件**只管已选项自己**。旁边那个「⊕ 增加」按调用方场景自行放置，
    不由本组件渲染——增加入口的形态随场景变化，绑死会限制复用。

    形态怎么选：**看它周围有没有边框，与「增加」二字本身无关**。
      · 与 PickedItem 并排（白底描边方块）→ 用**次按钮**（默认 <el-button>），
        统一带边框才协调，一个有框一个没框会显得少了一块。
      · 在表格 / 已有分割线的容器里 → 用 **<el-button text>**，
        容器自身的线已经在分区了，再套一层边框就是多余的框中框。

  接入方速查：
    基础：  <PickedItem label="人工智能" @remove="onRemove" />
    遍历：  <PickedItem v-for="k in list" :key="k" :label="k" @remove="() => remove(k)" />
  「已选值」天然可删（不可删就不是已选项、是普通文本），故删除叉是唯一形态，不设开关。

  外观（全在本组件源头，接入方无需关心，也不要在使用方 scoped 覆盖）：
    白底 + border-default 实线描边 + radius-sm；高度取控件基准高 --el-component-size（36），
    与同排的 el-input / el-select 等高；
    文字 body-sub / text-1；删除叉 Lucide X、icon-3 色，hover 转 text-1。
-->
<template>
  <span class="picked-item">
    <span class="picked-item__label">{{ label }}</span>
    <button
      type="button"
      class="picked-item__remove"
      :aria-label="`移除 ${label}`"
      @click="emit('remove')"
    >
      <X :size="14" :stroke-width="2" />
    </button>
  </span>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

/**
 * PickedItem 已选项（通用业务组件）
 * @prop label   显示文案（该已选值的名称）
 * @event remove 点击删除叉时触发，由调用方从自己的数据里移除该项
 */
defineProps<{ label: string }>()

const emit = defineEmits<{ remove: [] }>()
</script>

<style scoped>
/* 自己的骨架：与同排控件（el-input / el-select）等高，故取控件基准高 36 */
.picked-item {
  display: inline-flex;
  align-items: center;
  gap: var(--iflyv-spacing-1);
  height: var(--el-component-size);
  padding: 0 var(--iflyv-spacing-3);
  border: 1px solid var(--iflyv-border-default);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-bg-panel);
  box-sizing: border-box;
}

.picked-item__label {
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-1);
}

/* 删除叉：裸 button 去掉浏览器默认样式，只做图标的承载与取色 */
.picked-item__remove {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  color: var(--iflyv-icon-3);
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}
.picked-item__remove:hover {
  color: var(--iflyv-text-1);
}
</style>
