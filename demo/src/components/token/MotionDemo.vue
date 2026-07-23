<template>
  <section id="token-motion" class="demo-section" ref="rootEl">
    <h2 class="demo-section__title">Motion 动效</h2>

    <div class="demo-block">
      <p class="demo-label">动效 Animation — 时长三档 × 缓动三条；点击「播放」看小球运动曲线差异</p>
      <div class="token-motion-list">
        <div v-for="t in motionTokens" :key="t.name" class="token-motion-row">
          <span class="token-motion-row__head" @click="copyToken(t.name)" :title="`点击复制 var(${t.name})`">
            <span class="token-name">{{ t.name.replace('--iflyv-', '') }}</span>
            <span class="token-value">{{ rawValues[t.name] || '…' }}</span>
            <span class="token-desc">{{ t.desc }}</span>
          </span>
          <span class="token-motion-track">
            <span
              class="token-motion-ball"
              :key="`${t.name}-${replayKey}`"
              :style="{ transitionDuration: t.kind === 'duration' ? `var(${t.name})` : '0.8s', transitionTimingFunction: t.kind === 'easing' ? `var(${t.name})` : 'ease', transform: playing ? 'translateX(160px)' : 'translateX(0)' }"
            ></span>
          </span>
        </div>
        <el-button size="small" style="align-self: flex-start" @click="replay">播放</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { copyToken, useTokenValues } from './useTokens'

const motionTokens = [
  { name: '--iflyv-duration-fast', desc: '微交互：hover / 聚焦 / 开关', kind: 'duration' },
  { name: '--iflyv-duration-normal', desc: '常规：展开折叠 / Tab / 弹窗', kind: 'duration' },
  { name: '--iflyv-duration-slow', desc: '页面级：路由 / 骨架屏 / 大区域', kind: 'duration' },
  { name: '--iflyv-ease-default', desc: '通用缓动（尺寸 / 颜色变化）', kind: 'easing' },
  { name: '--iflyv-ease-decelerate', desc: '减速：元素出现', kind: 'easing' },
  { name: '--iflyv-ease-accelerate', desc: '加速：元素消失', kind: 'easing' },
]

const playing = ref(false)
const replayKey = ref(0)

function replay() {
  playing.value = false
  replayKey.value++
  requestAnimationFrame(() => requestAnimationFrame(() => (playing.value = true)))
}

const rootEl = ref<HTMLElement | null>(null)
const { rawValues } = useTokenValues(rootEl, motionTokens.map(t => t.name))
</script>

<style lang="scss" src="./token-demo.scss"></style>
