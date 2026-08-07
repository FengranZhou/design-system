<template>
  <section id="steps" class="demo-section">
    <h2 class="demo-section__title">Steps 轻量步骤条</h2>

    <!-- ⏸ 暂停展示：步骤条（align-center）。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">步骤条</p>
      <el-steps :active="1" align-center>
        <el-step title="提交申请" description="填写表单信息" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>
    -->

    <!-- ⏸ 暂停展示：竖向步骤条。暂时不用，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">竖向步骤条</p>
      <el-steps :active="1" direction="vertical" style="height: 240px;">
        <el-step title="提交申请" description="填写表单信息并提交" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>
    -->

    <div class="demo-block">
      <p class="demo-label">轻量步骤条</p>
      <el-steps :active="1" simple>
        <el-step title="提交申请" />
        <el-step title="审核中" />
        <el-step title="审核通过" />
      </el-steps>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Select / Input 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}
.demo-section .demo-block + .demo-block {
  margin-top: var(--iflyv-spacing-6);
}
</style>
