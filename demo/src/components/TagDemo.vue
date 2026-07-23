<template>
  <section id="tag" class="demo-section">
    <h2 class="demo-section__title">Tag 标签</h2>

    <div class="demo-block">
      <p class="demo-label">默认（圆角矩形）</p>
      <div class="demo-row">
        <el-tag type="primary">Primary</el-tag>
        <el-tag type="success">Success</el-tag>
        <el-tag type="warning">Warning</el-tag>
        <el-tag type="danger">Danger</el-tag>
        <el-tag type="info">Info</el-tag>
        <el-tag class="el-tag--gray">Gray</el-tag>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">胶囊形标签</p>
      <div class="demo-row">
        <el-tag type="primary" round>进行中</el-tag>
        <el-tag type="success" round>已完成</el-tag>
        <el-tag type="warning" round>待审核</el-tag>
        <el-tag type="danger" round>已驳回</el-tag>
        <el-tag type="info" round>已关闭</el-tag>
        <el-tag class="el-tag--gray" round>已归档</el-tag>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
