<template>
  <section id="rate" class="demo-section">
    <h2 class="demo-section__title">Rate 评分</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">用于教学评价、课程评分等主观打分；客观数值（85 分、完成度 60%）不要降级成 5 档星星。</p>

        <p class="demo-label">评分</p>
        <div class="demo-row">
          <el-rate v-model="rateValue" :allow-half="allowHalf" />
        </div>

        <p class="demo-label">只读展示</p>
        <div class="demo-row">
          <el-rate v-model="readonlyValue" disabled show-score score-template="{value} 分" />
        </div>

        <p class="demo-label">禁用</p>
        <div class="demo-row">
          <el-rate v-model="disabledValue" disabled />
        </div>
      </div>

      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="半星">
            <div class="config-field">
              <div class="config-field__row"><el-switch v-model="allowHalf" /></div>
              <p class="config-card__hint">评价类常见（如 4.5 分）；打分粒度只需整星时不必开</p>
            </div>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const rateValue = ref(3)
const readonlyValue = ref(4.5)
const disabledValue = ref(2)
const allowHalf = ref(false)

const configForm = reactive({ allowHalf })
</script>
