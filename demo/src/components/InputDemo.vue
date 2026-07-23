<template>
  <section id="input" class="demo-section">
    <h2 class="demo-section__title">Input 输入框</h2>

    <div class="demo-block">
      <p class="demo-label">Input 尺寸对比</p>
      <div class="demo-row">
        <el-input placeholder="Default" style="width: 200px" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">InputNumber 尺寸对比</p>
      <div class="demo-row">
        <el-input-number :model-value="1" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">基础输入框</p>
      <div class="demo-row">
        <el-input v-model="basicValue" placeholder="请输入内容" style="width: 240px" />
        <el-input placeholder="禁用状态" disabled style="width: 240px" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">可清除</p>
      <div class="demo-row">
        <el-input v-model="clearableValue" placeholder="可清除输入框" clearable style="width: 240px" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">带图标（Lucide · prefix / suffix slot）</p>
      <div class="demo-row">
        <el-input v-model="searchValue" placeholder="搜索" style="width: 240px">
          <template #prefix><Search :size="16" :stroke-width="2" /></template>
        </el-input>
        <el-input v-model="usernameValue" placeholder="用户名" style="width: 240px">
          <template #prefix><User :size="16" :stroke-width="2" /></template>
        </el-input>
        <el-input v-model="passwordValue" placeholder="密码" type="password" show-password style="width: 240px">
          <template #prefix><Lock :size="16" :stroke-width="2" /></template>
        </el-input>
        <el-input v-model="emailValue" placeholder="邮箱" style="width: 240px">
          <template #prefix><Mail :size="16" :stroke-width="2" /></template>
        </el-input>
      </div>
      <div class="demo-row" style="margin-top: 12px;">
        <el-input v-model="linkValue" placeholder="请输入链接" style="width: 240px">
          <template #suffix><Link :size="16" :stroke-width="2" /></template>
        </el-input>
        <el-input v-model="phoneValue" placeholder="手机号" style="width: 240px">
          <template #prefix><Phone :size="16" :stroke-width="2" /></template>
        </el-input>
      </div>
      <p class="demo-label" style="margin-top: 16px;">带图标 · 尺寸变体</p>
      <div class="demo-row">
        <el-input size="large" placeholder="Large 搜索" style="width: 200px">
          <template #prefix><Search :size="16" :stroke-width="2" /></template>
        </el-input>
        <el-input placeholder="Default 搜索" style="width: 200px">
          <template #prefix><Search :size="16" :stroke-width="2" /></template>
        </el-input>
        <el-input size="small" placeholder="Small 搜索" style="width: 200px">
          <template #prefix><Search :size="14" :stroke-width="2" /></template>
        </el-input>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">数字输入框</p>
      <div class="demo-row">
        <el-input-number v-model="numberValue" :min="1" :max="100" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">字数提示</p>
      <div class="demo-row">
        <el-input v-model="limitValue" maxlength="50" show-word-limit placeholder="最多 50 字" style="width: 240px" />
        <el-input v-model="limitTextarea" type="textarea" maxlength="200" show-word-limit :rows="3" placeholder="最多 200 字" style="width: 400px" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">文本域</p>
      <div class="demo-row">
        <el-input v-model="textareaValue" type="textarea" :rows="3" placeholder="请输入多行文本" style="width: 400px" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, User, Lock, Mail, Link, Phone } from 'lucide-vue-next'

const basicValue = ref('')
const clearableValue = ref('')
const searchValue = ref('')
const usernameValue = ref('')
const passwordValue = ref('')
const emailValue = ref('')
const linkValue = ref('')
const phoneValue = ref('')
const limitValue = ref('')
const limitTextarea = ref('')
const textareaValue = ref('')
const numberValue = ref(1)
</script>
