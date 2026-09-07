<template>
  <section id="pattern-form" class="demo-section">
    <h2 class="demo-section__title">Form Layout 表单布局</h2>

    <!-- 配置项卡片：承载容器切换，统管下方模式规则 + 标准范例。
         本身即用「表单布局模式」实现（标签+控件 → el-form），自我印证。 -->
    <div class="pattern-card">
      <p class="pattern-card__title">配置项</p>
      <el-form :model="configForm" label-width="auto">
        <el-form-item label="承载容器">
          <el-radio-group v-model="container">
            <el-radio value="page">页面 / 模块级</el-radio>
            <el-radio value="dialog">弹窗级</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <!-- 上块：模式规则 -->
    <div class="pattern-card">
      <p class="pattern-card__title">模式规则</p>
      <p class="pattern-card__desc">{{ containerDesc }}</p>

      <!-- 结构示意：上排「标签区 + 输入区」并排，下排「操作区」缩进对齐输入区起点 -->
      <div class="anatomy">
        <div class="anatomy-top">
          <div class="zone zone--label">
            <span class="zone__tag">标签区</span>
            <ul class="zone__rules">
              <li>右对齐</li>
              <li>宽度统一</li>
            </ul>
          </div>
          <div class="zone zone--field">
            <span class="zone__tag">输入区</span>
            <ul class="zone__rules">
              <li>左对齐</li>
              <li>项间等距纵排</li>
            </ul>
          </div>
        </div>
        <!-- 操作区：仅页面/模块级有；弹窗级由弹窗 footer 承载 -->
        <div v-if="container === 'page'" class="anatomy-bottom">
          <div class="zone zone--action">
            <span class="zone__tag">操作区</span>
            <ul class="zone__rules">
              <li>主操作在左</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 下块：标准范例 -->
    <div class="pattern-card">
      <p class="pattern-card__title">标准范例</p>
      <el-form :model="form" :rules="rules" label-width="auto" style="max-width: 480px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%;">
            <el-option label="设计部" value="design" />
            <el-option label="研发部" value="dev" />
            <el-option label="产品部" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="form.notify">
            <el-checkbox label="邮件" value="email" />
            <el-checkbox label="短信" value="sms" />
            <el-checkbox label="站内信" value="internal" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
        <!-- 操作按钮：仅页面/模块级放表单底部；弹窗级由弹窗 footer 承载。
             label=" " 空占位使按钮组在 label-width="auto" 下也对齐到输入区左缘。 -->
        <el-form-item v-if="container === 'page'" label=" ">
          <el-button type="primary">提交</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { FormRules } from 'element-plus'

// 承载容器：page = 页面/模块级（有操作区）；dialog = 弹窗级（操作交给弹窗 footer）
const container = ref('page')
const configForm = reactive({ container })  // el-form 需要 model；container 即配置值
const containerDesc = computed(() =>
  container.value === 'page'
    ? '页面 / 模块级表单：由「标签区 · 输入区 · 操作区」三部分组成，操作区在表单底部。'
    : '弹窗级表单：只有「标签区 · 输入区」，操作按钮由弹窗自带的 footer 承载，表单本体不含操作区。'
)

const form = reactive({ username: '', email: '', department: '', date: '', notify: [] as string[], enabled: true, remark: '' })
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

// 三区宽度比例，用 CSS grid 变量统一控制标签/引导/示例/规则四行的列对齐
</script>

<style scoped>
/* 纯本页排版，全部走令牌 */

/* —— 结构示意图：上排「标签区+输入区」并排，下排「操作区」缩进对齐输入区起点 —— */
.anatomy {
  --col-label: 120px;   /* 标签区宽度 */
  --gap: var(--iflyv-spacing-4);
  max-width: 760px;
}
.anatomy-top {
  display: flex;
  gap: var(--gap);
  align-items: stretch;   /* 标签区与输入区等高 */
}
.anatomy-bottom {
  /* 缩进 = 标签区宽 + 列间距，使操作区左缘对齐输入区起点 */
  margin-top: var(--gap);
  padding-left: calc(var(--col-label) + var(--gap));
}

/* 区块卡片：纯白、柔描边、区名淡色胶囊浮左上、规则圆点竖排、内容垂直居中 */
.zone {
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-lg);
}
.zone--label { flex: 0 0 var(--col-label); }
.zone--field { flex: 0 0 400px; }
/* 操作区：胶囊与规则横排（其他区保持竖排）。
   父级 .anatomy-bottom 是 block，flex-basis 不生效，故用 width 硬约束 280px。 */
.zone--action {
  width: 280px;
  flex-direction: row;
  align-items: center;
  gap: var(--iflyv-spacing-4);
  min-height: 0;
}

/* 区名：淡色胶囊标签，浮在左上 */
.zone__tag {
  align-self: flex-start;
  padding: var(--iflyv-spacing-1) var(--iflyv-spacing-3);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-info-bg);
  color: var(--iflyv-info-primary);
  font: var(--iflyv-font-title-component);
}

/* 规则：圆点竖排，垂直居中于卡片剩余空间 */
.zone__rules {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--iflyv-spacing-2);
  margin: 0;
  padding-left: var(--iflyv-spacing-6);
  list-style: disc;
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-body-sub);
}

/* 操作区横排：规则紧跟胶囊右侧。
   list-style-position:inside 让圆点算进内容流、贴紧 ul 左缘，
   使「胶囊右缘 → 圆点」的距离就等于父级 gap(16px)，不再被 marker 外凸撑大。 */
.zone--action .zone__rules {
  flex: 0 0 auto;
  justify-content: center;
  padding-left: 0;
  list-style-position: inside;
}

/* —— 真实范例标题 —— */
.pattern-example-label {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
</style>
