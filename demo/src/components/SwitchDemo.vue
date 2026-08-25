<template>
  <section id="switch" class="demo-section">
    <h2 class="demo-section__title">Switch 开关
      <CopyToCC anchor="switch" :values="switchConfigForm" />
    </h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">需要表示开关状态/两种状态之间的切换时使用，和 checkbox 的区别是，切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。</p>
        <!-- 文字开关切换 switch 文字标签是否显示；关闭（默认）则只留开关本体。
             位置默认右侧（active-text，EP 默认渲染在右）；仅当开关左侧无内容、
             右侧存在其他内容时才改用 inactive-text 置左，避免文字与右侧内容挤在
             一起归属不清。两者互斥，一个开关只配一个标签。
             字重 / spacing-2 间距 / 常态与禁用态取色全在源头 switch.scss。
             文字内容为各自的状态名：开关 / 关闭禁用 / 开启禁用。 -->
        <div class="demo-row">
          <el-switch
            v-model="switchValue1"
            :active-text="textOnRight ? '开关' : undefined"
            :inactive-text="textOnLeft ? '开关' : undefined"
          />
          <el-switch
            disabled :model-value="false"
            :active-text="textOnRight ? '关闭禁用' : undefined"
            :inactive-text="textOnLeft ? '关闭禁用' : undefined"
          />
          <el-switch
            disabled :model-value="true"
            :active-text="textOnRight ? '开启禁用' : undefined"
            :inactive-text="textOnLeft ? '开启禁用' : undefined"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="switchConfigForm" label-width="auto">
          <el-form-item label="文字">
            <el-switch v-model="switchShowText" />
          </el-form-item>
          <!-- 位置仅在「文字」开启时可选；关闭文字后无位置可言，故置灰。
               两个互斥选项、需并排比较 → 用 Radio 而非 Select（见 select-pattern） -->
          <el-form-item label="文字位置">
            <el-radio-group v-model="switchTextPosition" :disabled="!switchShowText">
              <el-radio value="right">右侧</el-radio>
              <el-radio value="left">左侧</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
import { ref, reactive, computed } from 'vue'

const switchValue1 = ref(true)

// Switch 文字：默认关闭（不展示 active-text / inactive-text），开启则显示状态名
const switchShowText = ref(false)
// 文字位置：默认右侧（active-text）。左侧（inactive-text）是窄条件例外——
// 仅当开关左侧无内容、右侧存在其他内容时才用，避免文字与右侧内容挤在一起。
const switchTextPosition = ref<'left' | 'right'>('right')
const textOnRight = computed(() => switchShowText.value && switchTextPosition.value === 'right')
const textOnLeft = computed(() => switchShowText.value && switchTextPosition.value === 'left')
const switchConfigForm = reactive({ switchShowText, switchTextPosition })
</script>
