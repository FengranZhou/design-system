<!-- ============================================================================
  StepBar 步骤条（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：多步骤流程的头部进度指示（填写→生成→完成、第几步 / N 步）。
  引用：  import { StepBar } from '<path>/design-spec/components'
  用法：
    <StepBar :steps="['填写要求', '生成清单', '生成内容']" :current="2" />
    <StepBar :steps="['填写要求', '生成清单', '生成内容']" :current="3" finished />  <!-- 全部完成 -->
  props：
    steps    string[]  必填。步骤文案数组，长度即步骤数（2/3/4/5… 任意）。
    current  number    可选，默认 1。当前步（1-based）：< current 为已完成、= 为当前、> 为未开始。
    finished boolean   可选，默认 false。整条流程已全部完成：所有步骤（含最后一步）都转完成态打勾。
                       用于流程走完、越过末步的终态；此时 current 仅影响接力动效的起点，不再有「进行中」步。
  外观/动效（全在本组件源头，接入方无需关心，也不要在使用方 scoped 覆盖）：
    大圆节点 + 补零两位序号（01/02）+ 三段拼接的渐变粗连接线（两端弧头不随宽度变形）
    + 完成态勾图标 + 前进/回退的分段链式过渡动效。全部走 --iflyv-* 令牌，随品牌色/主题同步。
  禁止：手写 div 拼步骤条、用 el-steps 复刻这套观感——一律用本组件。
  改外观：回本文件源头改，改一次所有引用方同步（勿在使用方私自覆盖）。
============================================================================ -->
<template>
  <!-- 步骤条：大圆节点 + 序号（补零两位）+ 粗渐变连接线，文字在节点下方。
       视觉/动效为设计系统标准步骤条外观，步骤数由 steps 决定、当前步由 current 决定。 -->
  <div class="step-bar" :style="maskStyle">
    <template v-for="(step, index) in steps" :key="index">
      <div
        class="step-bar__item"
        :class="{
          'is-active': finished || current >= index + 1,
          'is-completed': finished || current > index + 1,
        }"
        :style="{ '--seg-delay': `${circleDelay(index)}s` }"
      >
        <div class="step-bar__circle">
          <!-- 已完成：勾图标；未完成：补零两位序号 -->
          <svg
            v-if="finished || current > index + 1"
            class="step-bar__check"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span v-else class="step-bar__num">{{ String(index + 1).padStart(2, '0') }}</span>
        </div>
        <span class="step-bar__label">{{ step }}</span>
      </div>
      <!-- 连接线：末步之后不渲染 -->
      <div
        v-if="index < steps.length - 1"
        class="step-bar__line"
        :style="{ '--seg-delay': `${lineDelay(index)}s` }"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
// 连接线切图（两端内凹弧贴合节点圆）：显式 import 让 Vite 走模块解析，dev/build 都稳定拿到 URL，
// 再通过 CSS 变量喂给 mask（比在 scss 里写相对 url() 更可靠，避免 scoped 样式相对路径解析歧义）。
import { computed, ref, watch } from 'vue'
// 连接线切成三段做 mask（避免整张图随线宽拉伸变形）：两端弧头固定宽、中段弹性拉伸。
// 弧头原图 24×96，线高 48 → 弧头缩放宽 12px；中段纯矩形可任意横向拉伸。
import capLeft from './assets/line-cap-left.png'
import capRight from './assets/line-cap-right.png'
import lineMid from './assets/line-mid.png'

/**
 * StepBar 步骤条（通用业务组件）
 * @prop steps    步骤文案数组，长度即步骤数（可配 3 / 4 / 5…）
 * @prop current  当前步（1-based）；< 的为已完成、= 的为当前、> 的为未开始
 * @prop finished 整条流程已全部完成：所有步骤（含最后一步）都转完成态打勾（终态）
 */
const props = withDefaults(defineProps<{
  steps: string[]
  current?: number
  finished?: boolean
}>(), {
  current: 1,
  finished: false,
})

// 三张切图 URL 注入 CSS 变量（引号包裹兼容 data-uri）；scss 里用三层 mask 组合。
const maskStyle = computed(() => ({
  '--step-cap-left': `url("${capLeft}")`,
  '--step-cap-right': `url("${capRight}")`,
  '--step-line-mid': `url("${lineMid}")`,
}))

/* ───────── 跨步切换的串行接力时序 ─────────
   纯 CSS 的固定 transition-delay 只能编排「相邻单步」；跨多步（如 1→5）时多段线/多个圆
   会同时点亮 = 并发。改为按元素在「本次变化区间」内的空间次序，动态算递增延迟：
   第 k 个变化的元素延迟 k×STEP_T，从而逐段接力（前进从左到右、回退从右到左）。 */
const STEP_T = 0.28  // 单段/单圆点亮时长（秒），与 scss 里过渡时长同量级

// 上一个 current（用于判断本次变化方向与区间）
const prev = ref(props.current)
watch(() => props.current, (_n, o) => { prev.value = o })

// 本次变化区间 [lo, hi)（1-based 边界），及方向
const changeLo = computed(() => Math.min(prev.value, props.current))
const changeHi = computed(() => Math.max(prev.value, props.current))
const forward = computed(() => props.current >= prev.value)

// 圆（1-based 位置 circlePos）在本次变化区间里的「接力次序」（0,1,2…）。
// 前进点亮的圆是 (prev, current]（左端 prev 已亮不动）；回退熄灭的圆是 (current, prev]（current 保持不动）。
// 前进：靠左的先亮；回退：靠右的先退。区间外返回 0（不参与接力，延迟为 0）。
function circleOrder(circlePos: number): number {
  if (circlePos <= changeLo.value || circlePos > changeHi.value) return 0
  return forward.value
    ? circlePos - changeLo.value - 1   // 前进：区间内靠左先亮
    : changeHi.value - circlePos        // 回退：区间内靠右先退
}

// 线（0-based index，连接第 index+1 与 index+2 步，跨越 1-based 边界 index+1）在区间里的接力次序。
// 变化的线是段序 [changeLo, changeHi) 边界，即 0-based index ∈ [changeLo-1, changeHi-1)。
// 前进：靠左的段先填；回退：靠右的段先退。区间外返回 0。
function lineOrder(index: number): number {
  const boundary = index + 1  // 该线跨越的 1-based 边界（左圆的序号）
  if (boundary < changeLo.value || boundary >= changeHi.value) return 0
  return forward.value
    ? boundary - changeLo.value        // 前进：靠左段先填（changeLo 段次序 0）
    : changeHi.value - 1 - boundary     // 回退：靠右段先退（最右段次序 0）
}

// 圆 i（0-based）的接力延迟行内变量：圆位于 1-based 的 index+1
function circleDelay(index: number): number {
  return circleOrder(index + 1) * STEP_T
}
// 线 i（0-based）的接力延迟
function lineDelay(index: number): number {
  return lineOrder(index) * STEP_T
}
</script>

<style scoped lang="scss">
/* 步骤指示器（大圆节点 + 图标 + 粗渐变连接线，文字在节点下方）。
   形态：40px 白圆 + 5px 描边环，内嵌序号/勾；48px 高连接线用切图 mask 取形、伪元素上色贯通节点之间。
   透明底，可融入承载它的容器（如弹窗 header 渐变区）。 */
.step-bar {
  display: flex;
  align-items: flex-start;
  /* 底部内边距 = 原 spacing-4 + 24px：标签已绝对定位脱离文档流（见 __label），
     行内最高的是 48px 连接线，而标签底缘在 52+20=72px 处，超出 24px 需在此预留 */
  padding: var(--iflyv-spacing-2) var(--iflyv-spacing-6) calc(var(--iflyv-spacing-4) + 24px);
  background: transparent;
  flex-shrink: 0;
}

.step-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  /* 跨步接力延迟（行内 --seg-delay 覆盖，默认 0）：跨多步时按空间次序递增，逐段接力点亮 */
  --seg-delay: 0s;
  /* 标签绝对定位后节点宽度恒为 40px 圆本身，与文字长短彻底解耦；
     连接线负 margin 钻入圆下 → 圆的不透明白底需盖在线头之上，抬高层级 */
  position: relative;
  z-index: 1;
}

/* 节点圆：外圆 40 + 5px 描边环，内嵌序号/勾（颜色随 color）。
   未激活环色 = border-default（gray-10 @10%），与连接线未到段同色。 */
.step-bar__circle {
  width: 40px;
  height: 40px;
  /* 线高 48 顶部对齐，圆 40 下移 4px 让圆心与线中心（24px）对齐 */
  margin-top: 4px;
  box-sizing: border-box;
  border: 5px solid var(--iflyv-border-default);
  border-radius: var(--iflyv-radius-full);
  background: var(--iflyv-bg-panel);
  /* 白底只填到描边内侧：半透明描边环透出容器渐变底，与同色连接线观感一致 */
  background-clip: padding-box;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--iflyv-text-2);
  /* 回退（失去 active）时走此基态熄灭：叠加接力延迟 --seg-delay，从右向左依次熄灭 */
  transition: all 0.25s cubic-bezier(0, 0, 0.2, 1) calc(0.1s + var(--seg-delay));
}

/* 当前 / 已完成步骤：环变品牌色；内容色（完成态勾图标继承此 color）用强调黑。
   前进时延迟 0.35s 点亮（接在左侧线段填充之后，形成从左到右的节奏）；
   失去 active 时走基态无延迟 transition，回退即时还原。 */
.step-bar__item.is-active .step-bar__circle {
  border-color: var(--iflyv-brand-primary);
  color: var(--iflyv-text-1);
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1) calc(0.35s + var(--seg-delay));
}

/* 已完成步骤：圆内勾图标随文字同为品牌绿（同特异性，靠顺序覆盖 is-active） */
.step-bar__item.is-completed .step-bar__circle {
  color: var(--iflyv-brand-primary);
}

/* 圆内序号（01/02/03）：body-sub 14/20；未开始 text-3 */
.step-bar__num {
  font: var(--iflyv-font-body-sub);
  /* body-sub token 自带 weight 400，按设计覆盖为 Semibold */
  font-weight: var(--iflyv-font-weight-semibold);
  color: var(--iflyv-text-3);
  /* 回退熄灭基态：叠加接力延迟，从右向左依次还原 */
  transition: color 0.25s cubic-bezier(0, 0, 0.2, 1) calc(0.1s + var(--seg-delay));
}

/* 激活 / 完成步骤的序号：text-1；与圆环同节奏延迟点亮 */
.step-bar__item.is-active .step-bar__num {
  color: var(--iflyv-text-1);
  transition: color 0.2s cubic-bezier(0, 0, 0.2, 1) calc(0.35s + var(--seg-delay));
}

/* 完成态勾图标进场：轻缩放淡入 */
.step-bar__item.is-completed .step-bar__check {
  animation: step-bar-check-in 0.3s ease;
}

/* 文字标签：未开始 text-3；base transition 供颜色切换补间。
   绝对定位脱离文档流：文字不参与节点宽度计算（圆是几何锚点、文字只是注释），
   任意长短都不影响连接线与圆的衔接——top = 圆下移 4px + 圆 40px + 间隔 8px。 */
.step-bar__label {
  position: absolute;
  top: calc(44px + var(--iflyv-spacing-2));
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-3);
  /* 回退熄灭基态：叠加接力延迟，从右向左依次还原 */
  transition: color 0.25s cubic-bezier(0, 0, 0.2, 1) calc(0.1s + var(--seg-delay));
}

/* 当前步骤文字：text-1 + Semibold；前进时与圆环同节奏延迟点亮 */
.step-bar__item.is-active .step-bar__label {
  color: var(--iflyv-text-1);
  font-weight: var(--iflyv-font-weight-semibold);
  transition: color 0.2s cubic-bezier(0, 0, 0.2, 1) calc(0.35s + var(--seg-delay));
}

/* 已完成步骤文字：品牌绿（与圆环、勾图标同色）+ Semibold。
   is-completed 同时带 is-active，靠书写顺序覆盖上面的 text-1。 */
.step-bar__item.is-completed .step-bar__label {
  color: var(--iflyv-brand-primary);
}

/* 连接线：形状由三张切图拼接（两端弧头 line-cap-left/right + 中段 line-mid），用 mask 取形、background 上色。
   两端弧头固定 12px 不拉伸、中段弹性拉伸 → 任意线宽下弧头都不变形（整张图 mask 会随宽度拉平，故切三段）。
   高度与节点圆同为 48px，顶部对齐即与圆垂直居中；负 margin 让弧口贴到圆轮廓。
   底色固定为未到段灰（border-default），品牌色进度用两层伪元素叠加（渐变层 + 纯色层），
   background-image 渐变无法补间 → 伪元素 transform 做过渡动效。 */
.step-bar__line {
  flex: 1;
  height: 48px;
  position: relative;
  /* z-index:0 建立自身层叠上下文，把 ::before/::after 收纳在内，
     防止伪元素逃逸到与节点（z-index:1）同级竞争层叠 */
  z-index: 0;
  background: var(--iflyv-border-default);
  /* 跨步接力延迟（行内 --seg-delay 覆盖，默认 0） */
  --seg-delay: 0s;
  /* -4px = 纯塞入量：标签已绝对定位、节点宽度恒为 40px 圆，线端钻入圆下 4px 保证无缝衔接，
     12px 弧头露出 8px 贴合圆轮廓。勿改回合成魔法数字（旧 -12px 隐式依赖标签宽度，文字一长就断缝） */
  margin: 0 -4px;
  /* 三层 mask 拼接：左弧头(贴左,固定12) + 右弧头(贴右,固定12) + 中段(填中间,弹性拉伸)。
     多层 mask 默认相加(add)组合，三段无缝拼成完整线形，任意线宽下弧头都不变形。 */
  mask-image: var(--step-cap-left), var(--step-cap-right), var(--step-line-mid);
  mask-repeat: no-repeat, no-repeat, no-repeat;
  mask-position: left center, right center, center center;
  mask-size: 12px 48px, 12px 48px, calc(100% - 24px) 48px;
  -webkit-mask-image: var(--step-cap-left), var(--step-cap-right), var(--step-line-mid);
  -webkit-mask-repeat: no-repeat, no-repeat, no-repeat;
  -webkit-mask-position: left center, right center, center center;
  -webkit-mask-size: 12px 48px, 12px 48px, calc(100% - 24px) 48px;

  /* 两层品牌色填充（都被父级 mask 裁成线形）：::before 进行中渐变层，::after 完成纯色层 */
  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left center;
    /* 基态（回退退回灰）：叠加接力延迟，从右向左依次退去 */
    transition:
      opacity 0.35s cubic-bezier(0.5, 0, 1, 1) var(--seg-delay),
      transform 0.35s cubic-bezier(0.5, 0, 1, 1) var(--seg-delay);
  }

  /* 进行中：品牌绿 → 透明渐变，50% 处已完全淡出（透出底灰，与未到段自然衔接）。
     品牌绿统一 40% 不透明度（用 color-mix 从品牌色派生，不硬编码 hex）。 */
  &::before {
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--iflyv-brand-primary) 40%, transparent) 0%,
      transparent 50%
    );
  }

  /* 完成：品牌绿纯色 */
  &::after {
    background: var(--iflyv-brand-primary);
  }
}

/* 回退时（左节点保持 active）：纯色层延迟 0.4s 从右向左退去，
   与 ::before 渐变层的恢复同步交叉，避免露出全灰 */
.step-bar__item.is-active + .step-bar__line::after {
  transition:
    opacity 0.45s cubic-bezier(0, 0, 0.2, 1) calc(0.4s + var(--seg-delay)),
    transform 0.45s cubic-bezier(0, 0, 0.2, 1) calc(0.4s + var(--seg-delay));
}

/* 当前步骤右侧的线：渐变层从左向右展开。
   前进时延迟 0.4s（左侧线填充 → 圆点亮 → 本段展开的链式节奏收尾） */
.step-bar__item.is-active + .step-bar__line::before {
  opacity: 1;
  transform: scaleX(1);
  transition:
    opacity 0.5s cubic-bezier(0, 0, 0.2, 1) calc(0.4s + var(--seg-delay)),
    transform 0.5s cubic-bezier(0, 0, 0.2, 1) calc(0.4s + var(--seg-delay));
}

/* 已完成段：纯色层从左向右填满，渐变层淡出（交叉过渡，无跳色） */
.step-bar__item.is-completed + .step-bar__line::before {
  opacity: 0;
  /* 渐变层随本段接力次序交叉淡出（与 ::after 同延迟），无跳色 */
  transition:
    opacity 0.35s cubic-bezier(0.5, 0, 1, 1) var(--seg-delay),
    transform 0.35s cubic-bezier(0.5, 0, 1, 1) var(--seg-delay);
}

.step-bar__item.is-completed + .step-bar__line::after {
  opacity: 1;
  transform: scaleX(1);
  /* 已完成段填充：按本段接力次序延迟（--seg-delay），跨多步时逐段接力从左往右填 */
  transition:
    opacity 0.35s cubic-bezier(0.5, 0, 1, 1) var(--seg-delay),
    transform 0.35s cubic-bezier(0.5, 0, 1, 1) var(--seg-delay);
}

@keyframes step-bar-check-in {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
