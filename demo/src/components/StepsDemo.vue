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
      <p class="demo-desc">引导用户按照流程完成任务的导航条，当任务复杂或者存在先后关系时，将其分解成一系列步骤，从而简化任务。</p>
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
