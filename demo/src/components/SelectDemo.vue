<template>
  <section id="select" class="demo-section">
    <h2 class="demo-section__title">Select 选择器</h2>

    <div class="demo-block">
      <p class="demo-label">Select 尺寸对比</p>
      <div class="demo-row">
        <el-select size="large" placeholder="Large" style="width: 200px">
          <el-option label="选项一" value="1" />
          <el-option label="选项二" value="2" />
        </el-select>
        <el-select placeholder="Default" style="width: 200px">
          <el-option label="选项一" value="1" />
          <el-option label="选项二" value="2" />
        </el-select>
        <el-select size="small" placeholder="Small" style="width: 200px">
          <el-option label="选项一" value="1" />
          <el-option label="选项二" value="2" />
        </el-select>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Cascader 尺寸对比</p>
      <div class="demo-row">
        <el-cascader size="large" placeholder="Large" :options="cascaderOptions" style="width: 220px" />
        <el-cascader placeholder="Default" :options="cascaderOptions" style="width: 220px" />
        <el-cascader size="small" placeholder="Small" :options="cascaderOptions" style="width: 220px" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">基础选择器</p>
      <div class="demo-row">
        <el-select v-model="selectValue" placeholder="请选择" style="width: 240px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select placeholder="禁用状态" disabled style="width: 240px">
          <el-option label="选项一" value="1" />
        </el-select>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">可清除 / 可搜索</p>
      <div class="demo-row">
        <el-select v-model="clearableSelect" clearable placeholder="可清除" style="width: 240px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filterableSelect" filterable placeholder="可搜索" style="width: 240px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">多选</p>
      <div class="demo-row">
        <el-select v-model="multiSelect" multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2" placeholder="多选模式" style="width: 360px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">分组选择</p>
      <div class="demo-row">
        <el-select v-model="groupSelect" placeholder="请选择" style="width: 240px">
          <el-option-group v-for="group in groupOptions" :key="group.label" :label="group.label">
            <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
          </el-option-group>
        </el-select>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">级联选择器</p>
      <div class="demo-row">
        <el-cascader v-model="cascaderValue" :options="cascaderOptions" placeholder="请选择" style="width: 300px" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectValue = ref('')
const clearableSelect = ref('')
const filterableSelect = ref('')
const multiSelect = ref([])
const groupSelect = ref('')
const cascaderValue = ref([])

const options = [
  { value: '1', label: '设计部' },
  { value: '2', label: '研发部' },
  { value: '3', label: '产品部' },
  { value: '4', label: '市场部' },
  { value: '5', label: '运营部' },
  { value: '6', label: '财务部' },
  { value: '7', label: '人事部' },
  { value: '8', label: '客服部' },
]

const groupOptions = [
  {
    label: '技术部门',
    options: [
      { value: 'fe', label: '前端开发' },
      { value: 'be', label: '后端开发' },
      { value: 'qa', label: '测试工程' },
    ],
  },
  {
    label: '业务部门',
    options: [
      { value: 'pd', label: '产品设计' },
      { value: 'op', label: '运营管理' },
      { value: 'mk', label: '市场营销' },
    ],
  },
]

const cascaderOptions = [
  { value: 'frontend', label: '前端开发', children: [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
  ]},
  { value: 'backend', label: '后端开发', children: [
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
  ]},
]
</script>
