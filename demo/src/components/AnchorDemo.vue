<template>
  <section id="anchor" class="demo-section">
    <h2 class="demo-section__title">Anchor 锚点</h2>

    <div class="demo-block">
      <p class="demo-desc">需要展现当前页面上可供跳转的锚点链接，以及快速在锚点之间跳转。</p>
      <div class="demo-row">
        <!-- offset=76：el-anchor 点击走 JS 滚动、不吃 html 的 scroll-padding-top，
             须显式传等值偏移（topbar 64 + spacing-3 12，见 global.scss），停靠才与侧栏锚点一致 -->
        <el-anchor direction="horizontal" :offset="76">
          <el-anchor-link href="#anchor" title="锚点" />
          <el-anchor-link href="#steps" title="轻量步骤条" />
          <el-anchor-link href="#dropdown" title="下拉菜单" />
          <el-anchor-link href="#input" title="输入框" />
        </el-anchor>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
