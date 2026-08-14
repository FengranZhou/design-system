<template>
  <section id="result" class="demo-section">
    <h2 class="demo-section__title">Result 结果页</h2>

    <div class="demo-block">
      <p class="demo-desc">当有重要操作需告知用户处理结果，且反馈内容较为复杂/重要时使用。</p>
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

</style>
