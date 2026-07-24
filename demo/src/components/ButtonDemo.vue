<template>
  <section id="button" class="demo-section">
    <h2 class="demo-section__title">Button 按钮</h2>

    <div class="button-showcase">
      <!-- 左侧：6 类 × 3 状态网格；图标 / 箭头由右侧开关统一控制 -->
      <div class="button-grid">
        <template v-for="s in states" :key="s.key">
          <el-button
            v-for="b in types"
            :key="b.key + s.key"
            :type="b.type"
            :text="b.text"
            :disabled="s.disabled"
            :loading="s.loading"
          >
            <template v-if="showIcon" #icon><Pencil :size="16" :stroke-width="2" /></template>
            {{ b.label }}
            <ChevronDown v-if="showCaret" class="btn-caret" :size="14" :stroke-width="2" />
          </el-button>
        </template>
      </div>

      <!-- 右侧：配置项卡片，控制整个网格的图标 / 下拉箭头。
           用「表单布局模式」实现（el-form + el-form-item），标签右对齐紧邻控件，
           与设计模式-表单布局、Empty 配置项保持一致 -->
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="图标">
            <el-switch v-model="showIcon" />
          </el-form-item>
          <el-form-item label="下拉">
            <el-switch v-model="showCaret" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Pencil, ChevronDown } from 'lucide-vue-next'

// 两个正交配置开关
const showIcon = ref(false)
const showCaret = ref(false)
// el-form 需要 model 对象；两个开关即表单字段
const configForm = reactive({ showIcon, showCaret })

// 6 种类型（列）
const types = [
  { key: 'default',  type: '',        text: false, label: '次按钮' },
  { key: 'primary',  type: 'primary', text: false, label: '主按钮' },
  { key: 'danger',   type: 'danger',  text: false, label: '危险按钮' },
  { key: 'text',     type: '',        text: true,  label: '文本次按钮' },
  { key: 'text-pri', type: 'primary', text: true,  label: '文本主按钮' },
  { key: 'text-dan', type: 'danger',  text: true,  label: '文本危险按钮' },
]

// 3 种状态（行）
const states = [
  { key: 'normal',   disabled: false, loading: false },
  { key: 'disabled', disabled: true,  loading: false },
  { key: 'loading',  disabled: false, loading: true  },
]
</script>

<style scoped>
/* 纯本页排版：左侧网格 + 右侧配置卡片横向布局。不含组件外观规则。 */
.button-showcase {
  display: flex;
  align-items: flex-start;
  /* 网格与配置卡片间距 48（= spacing-8 32 + spacing-4 16，凑值不写裸值） */
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));
}

/* 6 列 × 3 行按钮网格，每列内容水平居中对齐 */
.button-grid {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: center;      /* 同一行按钮垂直居中（text 无固定高，与实心按钮对齐） */
  justify-items: center;    /* 每格内容水平居中 → 同列按钮以列中心对齐 */
  gap: var(--iflyv-spacing-10);  /* 行列间距统一 40 */
}

/* 横向适配：窄屏时按 6→3→2 列递减，避免按钮被挤压变形。
   配置卡片在中屏就下移换行，把整行宽度让给网格，
   否则网格被右侧卡片挤窄、text 按钮文字会重叠。 */
@media (max-width: 1100px) {
  .button-showcase { flex-direction: column; }
  .config-card { width: 100%; }
  .button-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .button-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* 右侧配置项卡片：bg-card 包裹，「配置项」标题 + el-form 表单布局 */
.config-card {
  flex: 0 1 auto;
  width: 220px;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
</style>
