<template>
  <section id="result" class="demo-section">
    <h2 class="demo-section__title">Result 结果页</h2>

    <div class="demo-block">
      <p class="demo-label">结果页</p>
      <div class="result-showcase">
        <!-- 左侧：单个结果页，场景由右侧配置切换；描述与按钮由开关叠加 -->
        <div class="demo-row result-row">
          <el-result
            :icon="scene"
            :title="sceneMap[scene].title"
            :sub-title="showSubtitle ? sceneMap[scene].subtitle : ''"
          >
            <template v-if="showButton" #extra>
              <el-button type="primary">{{ sceneMap[scene].button }}</el-button>
            </template>
          </el-result>
        </div>

        <!-- 右侧：配置项卡片（与 Button demo 一致的表单布局） -->
        <aside class="config-card">
          <p class="config-card__title">配置项</p>
          <el-form :model="configForm" label-width="auto">
            <el-form-item label="场景">
              <el-radio-group v-model="scene">
                <el-radio value="success">正确</el-radio>
                <el-radio value="error">错误</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="描述">
              <el-switch v-model="showSubtitle" />
            </el-form-item>
            <el-form-item label="按钮">
              <el-switch v-model="showButton" />
            </el-form-item>
          </el-form>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 结果页配置：场景（正确/错误，互斥类型）+ 两个正交开关（描述 sub-title / 按钮 #extra）
const scene = ref<'success' | 'error'>('success')
const sceneMap = {
  success: { title: '提交成功', subtitle: '审核结果将在 1-3 个工作日内通知', button: '返回首页' },
  error:   { title: '提交失败', subtitle: '请检查后重新提交', button: '重新提交' },
} as const
const showSubtitle = ref(true)
const showButton = ref(true)
// el-form 需要 model 对象；配置即表单字段
const configForm = reactive({ scene, showSubtitle, showButton })
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Button / Select / Dialog 一致，本页排版走令牌） */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}

/* 纯本页排版：左侧结果展示 + 右侧配置卡片横向布局。不含组件外观规则。 */
.result-showcase {
  display: flex;
  align-items: flex-start;
  /* 展示区与配置卡片间距 48（= spacing-8 32 + spacing-4 16，凑值不写裸值） */
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));
}
.result-row {
  flex: 1;
  min-width: 0;
  gap: var(--iflyv-spacing-6);
  margin-bottom: 0;
}

/* 右侧配置项卡片：块卡（bg-card）内部用白底 + 细边框区分层次（与 Button 配置卡一致） */
.config-card {
  flex: 0 1 auto;
  width: 220px;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}

/* 窄屏时配置卡片下移换行，把整行宽度让给结果展示 */
@media (max-width: 1100px) {
  .result-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}
</style>
