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
      <div class="demo-row" style="gap: 24px;">
        <el-result icon="success" title="提交成功" sub-title="审核结果将在 1-3 个工作日内通知">
          <template #extra>
            <el-button type="primary">返回首页</el-button>
          </template>
        </el-result>
        <el-result icon="error" title="提交失败" sub-title="请检查后重新提交">
          <template #extra>
            <el-button type="primary">重新提交</el-button>
          </template>
        </el-result>
      </div>
    </div>

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
  </section>
</template>

<script setup lang="ts">
</script>
