<template>
  <section id="step-bar" class="demo-section">
    <h2 class="demo-section__title">StepBar 步骤条</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <!-- 步骤条本体：透明底，这里给一个浅色承载区便于观察（纯本页排版） -->
        <div class="step-bar-stage">
          <StepBar :steps="steps" :current="current" :finished="finished" />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="步骤数">
            <el-radio-group v-model="stepCount">
              <el-radio :value="2">2 步</el-radio>
              <el-radio :value="3">3 步</el-radio>
              <el-radio :value="4">4 步</el-radio>
              <el-radio :value="5">5 步</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="当前步">
            <el-radio-group v-model="current" :disabled="finished">
              <el-radio v-for="n in stepCount" :key="n" :value="n">{{ n }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="全部完成">
            <el-switch v-model="finished" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { StepBar } from '../../../../design-spec/components'

// 备选步骤文案池：按「步骤数」截取前 N 项，演示步骤数可配
const STEP_POOL = ['填写要求', '生成清单', '生成内容', '预览确认', '完成发布']

const stepCount = ref(3)
const current = ref(1)
const finished = ref(false)
const steps = computed(() => STEP_POOL.slice(0, stepCount.value))

// 步骤数变小时，把越界的「当前步」收回到末步
watch(stepCount, (n) => {
  if (current.value > n) current.value = n
})

const configForm = computed(() => ({
  stepCount: stepCount.value,
  current: current.value,
  finished: finished.value,
}))
</script>

<style scoped>

/* 步骤条承载区：浅底 + 圆角，模拟弹窗 header 那种承载环境便于观察（纯本页排版，不碰组件外观） */
.step-bar-stage {
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
  padding-top: var(--iflyv-spacing-2);
}

/* 本页配置项多（多行表单/单选组），配置卡加宽一档 */
.config-card {
  flex: 0 0 auto;
  width: 400px;
}

@media (max-width: 1100px) {
  /* 本页覆盖了 config-card 宽度，窄屏撑满需在此重申（scoped 特异性高于公共层） */
  .config-card { width: 100%; }
}
</style>
