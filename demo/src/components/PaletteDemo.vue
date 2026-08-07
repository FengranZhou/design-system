<template>
  <section id="palette" class="demo-section demo-plain">
    <h2 class="demo-section__title">Palette 基础色板</h2>

    <div class="demo-block">
      <div v-for="g in groups" :key="g.key" class="palette-group">
        <div class="palette-group__label">
          <span class="palette-group__dot" :style="{ background: `var(--iflyv-${g.key}-6)` }"></span>
          {{ g.label }}
        </div>
        <div class="palette-row">
          <div
            v-for="i in 10"
            :key="i"
            :ref="el => setCellRef(g.key, i - 1, el)"
            class="palette-cell"
            :class="cellTextClass(resolved[g.key]?.[i - 1])"
            :style="{ background: `var(--iflyv-${g.key}-${i})` }"
            :title="`var(--iflyv-${g.key}-${i}) → ${resolved[g.key]?.[i - 1] ?? ''}`"
          >
            <span class="palette-cell__step">{{ i }}</span>
            <span class="palette-cell__hex">{{ resolved[g.key]?.[i - 1] ?? '' }}</span>
          </div>
        </div>
      </div>

      <!-- 灰阶色板 -->
      <div class="palette-group" style="margin-top: 20px;">
        <div class="palette-group__label">
          <span class="palette-group__dot" :style="{ background: 'var(--iflyv-gray-6)' }"></span>
          Gray 灰阶
        </div>
        <div class="palette-row">
          <div
            v-for="i in 11"
            :key="i"
            :ref="el => setCellRef('gray', i - 1, el)"
            class="palette-cell"
            :class="cellTextClass(resolved.gray?.[i - 1])"
            :style="{ background: `var(--iflyv-gray-${i - 1})` }"
            :title="`var(--iflyv-gray-${i - 1}) → ${resolved.gray?.[i - 1] ?? ''}`"
          >
            <span class="palette-cell__step">{{ i - 1 }}</span>
            <span class="palette-cell__hex">{{ resolved.gray?.[i - 1] ?? '' }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { ComponentPublicInstance } from 'vue'

/*
 * 本组件不硬编码任何色值：
 * - 色块背景直接绑定 var(--iflyv-{family}-{step})，来源于 design-token 色板层
 * - hex 标签 = 运行时 getComputedStyle 实测渲染值
 * token 层改动会自动反映到本页，供审查比对。
 */

const groups = [
  { key: 'geekblue', label: 'GeekBlue 极客蓝' },
  { key: 'green',    label: 'Green 成功色' },
  { key: 'red',      label: 'Red 危险色' },
  { key: 'orange',   label: 'Orange 警告色' },
  { key: 'blue',     label: 'Blue 信息色' },
]

/* 实测结果：family → 各色阶渲染 hex */
const resolved = reactive<Record<string, string[]>>({})

/* 收集色块 DOM，实测其渲染背景色 */
const cellRefs: Record<string, HTMLElement[]> = {}
function setCellRef(family: string, index: number, el: Element | ComponentPublicInstance | null) {
  if (!(el instanceof HTMLElement)) return
  ;(cellRefs[family] ??= [])[index] = el
}

let canvasCtx: CanvasRenderingContext2D | null = null

function toHexPart(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0').toUpperCase()
}

/* computed color 字符串 → hex。rgb()/rgba() 直接解析，oklch()/color() 等经 canvas 归一化 */
function cssColorToHex(color: string): string {
  const m = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
  if (m) return `#${toHexPart(+m[1])}${toHexPart(+m[2])}${toHexPart(+m[3])}`
  if (!canvasCtx) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    canvasCtx = canvas.getContext('2d', { willReadFrequently: true })
  }
  if (!canvasCtx) return ''
  canvasCtx.clearRect(0, 0, 1, 1)
  canvasCtx.fillStyle = color
  canvasCtx.fillRect(0, 0, 1, 1)
  const d = canvasCtx.getImageData(0, 0, 1, 1).data
  return `#${toHexPart(d[0])}${toHexPart(d[1])}${toHexPart(d[2])}`
}

function measure() {
  /* 实测每个色块的渲染背景色 */
  for (const family of Object.keys(cellRefs)) {
    resolved[family] = cellRefs[family].map(el =>
      el ? cssColorToHex(getComputedStyle(el).backgroundColor) : ''
    )
  }
}

let themeObserver: MutationObserver | null = null

onMounted(async () => {
  await nextTick()
  measure()

  themeObserver = new MutationObserver(() => {
    requestAnimationFrame(measure)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-brand'],
  })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
})

/* 根据实测色亮度决定色块内文字颜色 */
function cellTextClass(hex: string | undefined): string {
  if (!hex || hex.length < 7) return 'cell--light-text'
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? 'cell--dark-text' : 'cell--light-text'
}
</script>

<style scoped lang="scss">
.palette-group {
  margin-bottom: 24px;
  &:last-child { margin-bottom: 0; }

  &__label {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--iflyv-text-3);
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

.palette-row {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
}

.palette-cell {
  flex: 1;
  height: 48px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  cursor: default;

  &__step {
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 1px;
  }

  &__hex {
    font-size: 8px;
    opacity: 0.55;
    text-transform: uppercase;
  }

  &.cell--dark-text {
    color: rgba(0, 0, 0, 0.6);
  }

  &.cell--light-text {
    color: rgba(255, 255, 255, 0.65);
  }
}

</style>
