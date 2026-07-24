<template>
  <section id="table" class="demo-section">
    <h2 class="demo-section__title">Table 表格</h2>

    <div class="demo-block">
      <p class="demo-label">数据表格（点击行查看选中效果，hover 查看操作列变色）</p>
      <el-table :data="tableData" highlight-current-row style="width: 100%">
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.statusType" round>{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="日期" width="150" sortable />
      <el-table-column prop="amount" label="金额" width="120" sortable :formatter="(_r: any, _c: any, val: number) => `¥${val.toLocaleString()}`" />
      <el-table-column label="操作" min-width="150">
        <template #default>
          <el-button class="table-operation" link>编辑</el-button>
          <el-button class="table-operation" link>查看</el-button>
          <el-button class="table-operation table-operation--danger" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>

    <div class="demo-block">
      <p class="demo-label">首尾列冻结</p>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="姓名" width="120" fixed="left" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.statusType" round>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="amount" label="金额" width="150" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="position" label="职位" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default>
            <el-button class="table-operation" link>编辑</el-button>
            <el-button class="table-operation" link>查看</el-button>
            <el-dropdown class="table-operation">
              <span class="table-operation__more">更多 <ChevronDown :size="14" :stroke-width="2" /></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>发布</el-dropdown-item>
                  <el-dropdown-item>下载</el-dropdown-item>
                  <el-dropdown-item divided>
                    <span style="color: var(--iflyv-danger-primary)">删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const tableData = [
  { name: '张三', status: '进行中', statusType: 'primary', date: '2026-03-10', amount: 1200, department: '技术部', position: '前端工程师', remark: '项目进展顺利' },
  { name: '李四', status: '已完成', statusType: 'success', date: '2026-03-11', amount: 3450, department: '产品部', position: '产品经理', remark: '已交付' },
  { name: '王五', status: '待审核', statusType: 'warning', date: '2026-03-12', amount: 890, department: '设计部', position: 'UI设计师', remark: '等待审批中' },
  { name: '赵六', status: '已驳回', statusType: 'danger', date: '2026-03-13', amount: 2100, department: '市场部', position: '市场专员', remark: '材料需补充' },
  { name: '钱七', status: '已关闭', statusType: 'info', date: '2026-03-14', amount: 560, department: '运营部', position: '运营专员', remark: '已归档' },
]
</script>
