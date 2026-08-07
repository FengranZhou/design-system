<template>
  <section id="switch" class="demo-section">
    <h2 class="demo-section__title">Switch 开关</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">需要表示开关状态/两种状态之间的切换时使用，和 checkbox 的区别是，切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。</p>
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
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const switchValue1 = ref(true)

// Switch 文字：默认关闭（不展示 active-text / inactive-text），开启则显示状态名
const switchShowText = ref(false)
const switchConfigForm = reactive({ switchShowText })
</script>
