<template>
  <section id="dropdown" class="demo-section">
    <h2 class="demo-section__title">Dropdown 下拉菜单
      <CopyToCC anchor="dropdown" :values="configForm" />
    </h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">常与"触发器"（按钮、图标、下拉选择器等）组合使用，当页面上的操作命令过多时，用此组件可以收纳操作元素。</p>
        <div class="demo-row">
          <el-dropdown @visible-change="dropdownVisible = $event">
            <!-- 轻量入口触发器：用 <el-button text> 承载，不用裸 span。
                 文字色 / hover 变色 / inline-flex 全在源头 button.scss，
                 且原生 <button> 自带键盘可聚焦与 role，使用方零 scoped。 -->
            <el-button text>
              更多操作
              <ChevronDown
                :size="14" :stroke-width="2"
                class="dropdown-caret"
                :class="{ 'is-expanded': dropdownVisible }"
              />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 分组：开关打开后，每组前加一行抬头（约定类 .dropdown-group-title，
                     源头 dropdown.scss）。抬头非可选项，故用裸 li 而非 el-dropdown-item。 -->
                <template v-if="grouped">
                  <template v-for="group in groupedItems" :key="group.title">
                    <li class="dropdown-group-title">{{ group.title }}</li>
                    <el-dropdown-item
                      v-for="it in group.items"
                      :key="it.label"
                      :disabled="it.disabled"
                    >{{ it.label }}</el-dropdown-item>
                  </template>
                </template>
                <template v-else>
                  <el-dropdown-item>编辑</el-dropdown-item>
                  <el-dropdown-item>复制</el-dropdown-item>
                  <el-dropdown-item>移动</el-dropdown-item>
                  <el-dropdown-item divided disabled>删除</el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="分组">
            <div class="config-field">
              <div class="config-field__row">
                <el-switch v-model="grouped" />
              </div>
              <p class="config-card__hint">选项超过约 7 条、且能按语义归类时开启，用抬头分段替代一长串平铺</p>
            </div>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
import { ref, reactive } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

// Dropdown 展开态：驱动触发器箭头翻转
const dropdownVisible = ref(false)

/** 配置项：分组（打开后菜单按语义分段，每段前加抬头） */
const grouped = ref(false)
const configForm = reactive({ grouped })

// 分组态的菜单数据：同一批操作按语义归类，演示抬头与选项的层级差异
const groupedItems: { title: string; items: { label: string; disabled?: boolean }[] }[] = [
  { title: '基础操作', items: [{ label: '编辑' }, { label: '复制' }, { label: '移动' }] },
  { title: '危险操作', items: [{ label: '删除', disabled: true }] },
]
</script>

<style scoped>

/* 本页无需任何触发器样式：轻量入口用 <el-button text>，
   文字色 / hover / inline-flex 归源头 button.scss，箭头间距与翻转归
   button.scss + dropdown.scss 的 .dropdown-caret —— demo 只传展开真值 .is-expanded。 */
</style>
