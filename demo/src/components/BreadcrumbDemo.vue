<template>
  <section id="breadcrumb" class="demo-section">
    <h2 class="demo-section__title">Breadcrumb 面包屑</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <!-- 一个带返回箭头 + 深层折叠的面包屑：8 级路径按「当前层级」截断到第 N 级，
             超过 max-items 时中间折进 `…`（hover 展开）；每项带 to 可点击跳转（demo 里跳转打日志示意）。 -->
        <div class="demo-row">
          <Breadcrumb
            :items="breadcrumbItems"
            :max-items="4"
            :back-disabled="breadcrumbItems.length <= 1"
            @back="onBreadcrumbBack"
            @item-click="onBreadcrumbItemClick"
          />
        </div>
      </div>
      <aside class="config-card config-card--breadcrumb">
        <p class="config-card__title">配置项</p>
        <el-form :model="breadcrumbConfigForm" label-width="auto">
          <el-form-item label="当前层级">
            <el-select v-model="breadcrumbCurrent" style="width: 100%">
              <el-option
                v-for="i in BREADCRUMB_FULL.length"
                :key="i"
                :label="`第 ${i} 级`"
                :value="i"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Breadcrumb } from '../../../design-spec/components'

// 面包屑：8 级全量路径，每项带 to（可点击跳转；demo 里跳转仅打日志示意，真实项目走 vue-router）。
// 「当前层级」配置项把路径截断到第 N 级（第 N 项即当前页、不可点）；超过 max-items(4) 时中间折进 `…`。
const BREADCRUMB_FULL = [
  { label: '首页', to: '/' },
  { label: '计算机学院', to: '/college' },
  { label: '数据结构', to: '/college/ds' },
  { label: '第三章 树', to: '/college/ds/ch3' },
  { label: '3.2 二叉树', to: '/college/ds/ch3/binary-tree' },
  { label: '课后作业', to: '/college/ds/ch3/binary-tree/homework' },
  { label: '学生提交列表', to: '/college/ds/ch3/binary-tree/homework/submissions' },
  { label: '学生提交详情', to: '/college/ds/ch3/binary-tree/homework/submissions/detail' },
]

// 当前选中层级（1-based，默认末级=8）；面包屑按此截断到前 N 项
const breadcrumbCurrent = ref(BREADCRUMB_FULL.length)
const breadcrumbItems = computed(() => BREADCRUMB_FULL.slice(0, breadcrumbCurrent.value))
const breadcrumbConfigForm = computed(() => ({ current: breadcrumbCurrent.value }))

// 点返回 = 回退一级（当前层级 -1）；到只剩首页时箭头禁用。真实项目里 @back 通常接 router.back()。
const onBreadcrumbBack = () => {
  if (breadcrumbCurrent.value > 1) breadcrumbCurrent.value -= 1
}
// 点击某一路径项（含 `…` 下拉里的项）：定位到该层级 = 把「当前层级」设为该项层级，面包屑随之截断。
// 真实项目里会用 item.to 走 vue-router 跳转；此处 index 即该项在全量路径中的 0-based 下标。
const onBreadcrumbItemClick = (_item: { label: string; to?: unknown }, index: number) => {
  breadcrumbCurrent.value = index + 1
}
</script>

<style scoped>

/* 面包屑配置卡仅一个下拉，固定一档合理宽度，避免被内容撑得过窄 */
.config-card--breadcrumb {
  flex: 0 1 auto;
  width: 280px;
}
@media (max-width: 1100px) {
  .config-card--breadcrumb { width: 100%; }
}
</style>
