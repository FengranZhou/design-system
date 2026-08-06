<template>
  <section id="other" class="demo-section">
    <h2 class="demo-section__title">Other 其他组件</h2>

    <!-- ⏸ 暂停展示：链接。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">链接</p>
      <div class="demo-row">
        <el-link type="default">默认链接</el-link>
        <el-link type="primary">主要链接</el-link>
        <el-link type="success">成功链接</el-link>
        <el-link type="warning">警告链接</el-link>
        <el-link type="danger">危险链接</el-link>
        <el-link type="info">信息链接</el-link>
        <el-link type="primary" disabled>禁用链接</el-link>
      </div>
    </div>
    -->

    <!-- ⏸ 暂停展示：分割线。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">分割线</p>
      <div>
        <p style="color: var(--iflyv-text-2);">上方内容区域</p>
        <el-divider />
        <p style="color: var(--iflyv-text-2);">下方内容区域</p>
        <el-divider content-position="center">居中文字</el-divider>
        <p style="color: var(--iflyv-text-2);">更多内容</p>
      </div>
    </div>
    -->

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

    <!-- ⏸ 暂停展示：回到顶部。暂时不用，保留代码，需要时放开（源头 el-theme/index.scss 的 backtop @use 也已同步注释，恢复时一起放开）。
    <div class="demo-block">
      <p class="demo-label">回到顶部</p>
      <div
        class="backtop-scroll-area"
        style="height: 200px; overflow-y: auto; border: 1px solid var(--el-border-color); border-radius: 4px; padding: 16px; position: relative;"
      >
        <p v-for="i in 20" :key="i" style="color: var(--iflyv-text-2); line-height: 2;">
          这是第 {{ i }} 行内容，向下滚动后右下角将出现 Backtop 按钮
        </p>
        <el-backtop target=".backtop-scroll-area" :visibility-height="50" />
      </div>
      <p style="color: var(--iflyv-text-3); font-size: 12px; margin-top: 8px;">
        提示：在上方区域向下滚动，右下角会出现回到顶部按钮。
      </p>
    </div>
    -->
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
/* demo 块用 bg-card 大卡片做区分（与 Button / Select / Dialog 一致，本页排版走令牌），两卡间距 spacing-6 */
.demo-section .demo-block {
  margin-bottom: var(--iflyv-spacing-6);
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.demo-section .demo-block:last-child {
  margin-bottom: 0;
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
