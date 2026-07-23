<template>
  <section id="navigation" class="demo-section">
    <h2 class="demo-section__title">Navigation 导航组件</h2>

    <div class="demo-block">
      <p class="demo-label">Tabs 页面级（.tabs-page）</p>
      <el-tabs v-model="activeTabLg" class="tabs-page">
        <el-tab-pane label="选中项" name="overview">选中项内容</el-tab-pane>
        <el-tab-pane label="未选中项" name="analysis">未选中项内容</el-tab-pane>
        <el-tab-pane label="禁用项" name="trash" disabled>禁用项内容</el-tab-pane>
      </el-tabs>
    </div>

    <div class="demo-block">
      <p class="demo-label">Tabs 大模块级（默认）</p>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="选中项" name="all">选中项内容</el-tab-pane>
        <el-tab-pane label="未选中项" name="active">未选中项内容</el-tab-pane>
        <el-tab-pane label="禁用项" name="archived" disabled>禁用项内容</el-tab-pane>
      </el-tabs>
    </div>

    <div class="demo-block">
      <p class="demo-label">Tabs 小模块级（.tabs-sub）</p>
      <el-tabs v-model="activeTabSm" class="tabs-sub">
        <el-tab-pane label="基本信息" name="basic">基本信息内容</el-tab-pane>
        <el-tab-pane label="权限配置" name="permission">权限配置内容</el-tab-pane>
        <el-tab-pane label="操作日志" name="log">操作日志内容</el-tab-pane>
        <el-tab-pane label="回收站" name="trash" disabled>回收站内容</el-tab-pane>
      </el-tabs>
    </div>

    <div class="demo-block">
      <p class="demo-label">Tabs 页面级 + 数字（.tabs-page + .tab-count）</p>
      <el-tabs v-model="activeTabLgCount" class="tabs-page">
        <el-tab-pane name="overview">
          <template #label>概览 <span class="tab-count">5</span></template>
          概览内容
        </el-tab-pane>
        <el-tab-pane name="analysis">
          <template #label>数据分析 <span class="tab-count">12</span></template>
          数据分析内容
        </el-tab-pane>
        <el-tab-pane name="settings">
          <template #label>系统设置 <span class="tab-count">3</span></template>
          系统设置内容
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="demo-block">
      <p class="demo-label">Tabs 大模块级 + 数字（.tab-count）</p>
      <el-tabs v-model="activeTabCount">
        <el-tab-pane name="all">
          <template #label>全部 <span class="tab-count">128</span></template>
          全部内容
        </el-tab-pane>
        <el-tab-pane name="active">
          <template #label>进行中 <span class="tab-count">36</span></template>
          进行中内容
        </el-tab-pane>
        <el-tab-pane name="done">
          <template #label>已完成 <span class="tab-count">82</span></template>
          已完成内容
        </el-tab-pane>
        <el-tab-pane name="archived" disabled>
          <template #label>已归档 <span class="tab-count">10</span></template>
          已归档内容
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="demo-block">
      <p class="demo-label">Tabs 小模块级 + 数字（.tabs-sub + .tab-count）</p>
      <el-tabs v-model="activeTabSmCount" class="tabs-sub">
        <el-tab-pane name="basic">
          <template #label>基本信息 <span class="tab-count">8</span></template>
          基本信息内容
        </el-tab-pane>
        <el-tab-pane name="permission">
          <template #label>权限配置 <span class="tab-count">4</span></template>
          权限配置内容
        </el-tab-pane>
        <el-tab-pane name="log">
          <template #label>操作日志 <span class="tab-count">26</span></template>
          操作日志内容
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="demo-block">
      <p class="demo-label">Breadcrumb 面包屑</p>
      <div class="demo-row">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>项目管理</el-breadcrumb-item>
          <el-breadcrumb-item>项目详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Dropdown 下拉菜单</p>
      <div class="demo-row">
        <el-dropdown>
          <el-button type="primary">
            更多操作
            <ChevronDown :size="14" :stroke-width="2" style="margin-left: 4px;" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>编辑</el-dropdown-item>
              <el-dropdown-item>复制</el-dropdown-item>
              <el-dropdown-item>移动</el-dropdown-item>
              <el-dropdown-item divided disabled>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 步骤条</p>
      <el-steps :active="1" align-center>
        <el-step title="提交申请" description="填写表单信息" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 竖向步骤条</p>
      <el-steps :active="1" direction="vertical" style="height: 240px;">
        <el-step title="提交申请" description="填写表单信息并提交" />
        <el-step title="审核中" description="等待管理员审核" />
        <el-step title="审核通过" description="完成流程" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 简洁模式（simple · 3步）</p>
      <el-steps :active="1" simple>
        <el-step title="提交申请" />
        <el-step title="审核中" />
        <el-step title="审核通过" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 简洁模式（simple · 5步）</p>
      <el-steps :active="2" simple>
        <el-step title="需求收集" />
        <el-step title="方案设计" />
        <el-step title="专家评审" />
        <el-step title="修订完善" />
        <el-step title="发布实施" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Steps 简洁模式（simple · 7步）</p>
      <el-steps :active="3" simple>
        <el-step title="提交申请" />
        <el-step title="院系初审" />
        <el-step title="教务复核" />
        <el-step title="专家评审" />
        <el-step title="修订反馈" />
        <el-step title="终审批准" />
        <el-step title="归档备案" />
      </el-steps>
    </div>

    <div class="demo-block">
      <p class="demo-label">Anchor 锚点</p>
      <div class="demo-row">
        <el-anchor direction="horizontal">
          <el-anchor-link href="#navigation" title="导航组件" />
          <el-anchor-link href="#data-display" title="数据展示" />
          <el-anchor-link href="#form" title="表单组件" />
          <el-anchor-link href="#feedback" title="反馈组件" />
        </el-anchor>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Pagination 分页</p>
      <div class="demo-row">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="80"
          layout="prev, pager, next, sizes, jumper"
        />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Pagination 分页（小型）</p>
      <div class="demo-row">
        <el-pagination
          v-model:current-page="currentPageSm"
          :page-size="10"
          :total="80"
          small
          layout="prev, pager, next"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const activeTabLg = ref('overview')
const activeTab = ref('all')
const activeTabSm = ref('basic')
const activeTabLgCount = ref('overview')
const activeTabCount = ref('all')
const activeTabSmCount = ref('basic')
const currentPage = ref(1)
const pageSize = ref(20)
const currentPageSm = ref(1)
</script>

<style scoped>
/* 纯 demo 布局：补 tab 头与内容区间距（不改组件外观，仅调本演示的排版留白） */
.demo-block :deep(.el-tabs__header) {
  margin-bottom: var(--iflyv-spacing-4);
}
</style>
