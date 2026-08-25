<template>
  <section id="alert" class="demo-section">
    <h2 class="demo-section__title">Alert 警告
      <CopyToCC anchor="alert" :values="alertConfigForm" />
    </h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">当提示内容较重要，并需要吸引用户查看时使用。</p>
        <!-- 单条实时示例：场景（语义色）× 辅助信息（带/不带描述）两个正交配置项叠加，共 5×2=10 种组合 -->
        <el-alert
          :key="alertScene.value + String(alertShowDesc)"
          :title="alertScene.title"
          :type="alertScene.type"
          :class="alertScene.class"
          :description="alertShowDesc ? alertScene.desc : undefined"
          show-icon
        />
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="alertConfigForm" label-width="auto">
          <el-form-item label="场景">
            <el-radio-group v-model="alertSceneKey">
              <el-radio v-for="s in alertScenes" :key="s.value" :value="s.value">{{ s.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="辅助信息">
            <el-switch v-model="alertShowDesc" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
import { ref, reactive, computed } from 'vue'

// —— 警告（Alert）：5 类语义场景，「场景」× 「辅助信息」两个正交配置项自由叠加（5×2=10 种组合）——
// 中性场景走约定 class .alert-neutral（EP 无中性 type，用 info 底 + 中性色覆盖，定义在源头）。
type AlertScene = {
  value: string; label: string; title: string
  type: 'success' | 'warning' | 'error' | 'info'; class?: string; desc: string
}
const alertScenes: AlertScene[] = [
  { value: 'success', label: '成功', title: '成功提示', type: 'success', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'warning', label: '警告', title: '警告提示', type: 'warning', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'error', label: '错误', title: '错误提示', type: 'error', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'info', label: '信息', title: '信息提示', type: 'info', desc: '这是一段辅助描述信息，提供更多上下文。' },
  { value: 'neutral', label: '中性', title: '中性提示', type: 'info', class: 'alert-neutral', desc: '这是一段辅助描述信息，提供更多上下文。' },
]
const alertSceneKey = ref('success')
const alertShowDesc = ref(false)
const alertScene = computed(() => alertScenes.find(s => s.value === alertSceneKey.value)!)
const alertConfigForm = reactive({ alertSceneKey, alertShowDesc })
</script>

<style scoped>

/* 本页配置项多（多行表单/单选组），配置卡加宽一档 */
.config-card {
  flex: 0 0 auto;
  width: 400px;
}

</style>
