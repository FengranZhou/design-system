<template>
  <section id="input" class="demo-section">
    <h2 class="demo-section__title">Input 输入框</h2>

    <!-- 左列（标题+示例）+ 右列配置卡；两列均从块顶开始 → 配置卡顶与标题顶齐平。 -->
    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">基础输入框</p>
        <div class="demo-row">
          <el-input
            v-model="basicValue"
            placeholder="请输入内容"
            :clearable="clearable"
            :maxlength="showWordLimit ? 50 : undefined"
            :show-word-limit="showWordLimit"
            style="width: 240px"
          />
          <el-input placeholder="禁用状态" disabled style="width: 240px" />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="可清除">
            <el-switch v-model="clearable" />
          </el-form-item>
          <el-form-item label="字数提示">
            <el-switch v-model="showWordLimit" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <!-- 搜索框（业务组件 SearchMini）：基础形式 ↔ 收起态由「默认收起」开关切换，
         二者是同一物料的一个 prop 差异（collapsed）。组件源头在 design-spec/components/SearchMini。 -->
    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">搜索框</p>
        <p class="demo-desc">默认实时搜索，若因技术限制，则点击图标 / Enter 触发搜索动作</p>
        <div class="demo-row">
          <!-- collapsed 切换：关 = 基础形式（常驻展开）；开 = 收起态（点图标展开、失焦收起） -->
          <SearchMini v-model="searchValue" :collapsed="searchCollapsed" placeholder="搜索" />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="searchConfigForm" label-width="auto">
          <!-- 默认收起开关 + 选型指引是一个整体字段单元：hint 放在同一 el-form-item 的 content 内，
               与 SelectDemo「可清除」配置布局一致。 -->
          <el-form-item label="默认收起">
            <div class="config-field">
              <!-- switch 套与 label 等高（component-size）的居中行，使其与 label 垂直居中对齐 -->
              <div class="config-field__row">
                <el-switch v-model="searchCollapsed" />
              </div>
              <p class="config-card__hint">{{ searchCollapsedHint }}</p>
            </div>
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <!-- ⏸ 暂停启用：带图标（prefix/suffix slot）图标样例演示。暂时用不到，保留代码，需要时放开。
    <div class="demo-block">
      <p class="demo-label">带图标（Lucide · prefix / suffix slot）</p>
      <div class="demo-row">
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
      <div class="demo-row" style="margin-top: var(--iflyv-spacing-3);">
        <el-input v-model="linkValue" placeholder="请输入链接" style="width: 240px">
          <template #suffix><Link :size="16" :stroke-width="2" /></template>
        </el-input>
        <el-input v-model="phoneValue" placeholder="手机号" style="width: 240px">
          <template #prefix><Phone :size="16" :stroke-width="2" /></template>
        </el-input>
      </div>
    </div>
    -->

    <div class="demo-block">
      <p class="demo-label">数字输入框</p>
      <div class="demo-row">
        <el-input-number v-model="numberValue" :min="1" :max="100" placeholder="请输入" />
      </div>
    </div>

    <div class="demo-block input-showcase">
      <div class="input-showcase__main">
        <p class="demo-label">文本域</p>
        <div class="demo-row">
          <el-input
            v-model="textareaValue"
            type="textarea"
            :rows="3"
            placeholder="请输入多行文本"
            :maxlength="textareaWordLimit ? 200 : undefined"
            :show-word-limit="textareaWordLimit"
            style="width: 400px"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="textareaConfigForm" label-width="auto">
          <el-form-item label="字数提示">
            <el-switch v-model="textareaWordLimit" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { SearchMini } from '../../../design-spec/components'
// ⏸ 放开「带图标」注释块时，一并放开下面这行 import：
// import { User, Lock, Mail, Link, Phone } from 'lucide-vue-next'

const basicValue = ref('')
// 基础输入框配置项：可清除 clearable + 字数提示 showWordLimit 开关（el-form 需要 model 对象）
const clearable = ref(false)
const showWordLimit = ref(false)
const configForm = reactive({ clearable, showWordLimit })
// 搜索框配置项：默认收起 collapsed 开关，切换 SearchMini 基础形式 ↔ 收起态
const searchValue = ref('')
const searchCollapsed = ref(false)
const searchConfigForm = reactive({ searchCollapsed })
// 选型指引：关闭（常驻展开）= 核心功能；开启（收起态）= 非核心功能
const searchCollapsedHint = computed(() =>
  searchCollapsed.value ? '应用场景中非核心功能' : '应用场景中为核心功能'
)
// ⏸ 放开「带图标」注释块时，一并放开下面这些变量：
// const usernameValue = ref('')
// const passwordValue = ref('')
// const emailValue = ref('')
// const linkValue = ref('')
// const phoneValue = ref('')
// 文本域配置项：字数提示 textareaWordLimit 开关
const textareaValue = ref('')
const textareaWordLimit = ref(false)
const textareaConfigForm = reactive({ textareaWordLimit })
const numberValue = ref(1)
</script>

<style scoped>
/* 纯本页排版：基础输入框左示例 + 右配置卡片横向布局。不含组件外观规则。
   与 Button / Empty 配置式范式一致。 */


/* 块卡内左右两列：左列（标题+示例）+ 右列配置卡，均从块顶开始 → 配置卡顶与标题顶齐平 */
.input-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48：spacing-8 32 + spacing-4 16 */
}
.input-showcase__main { flex: 1; min-width: 0; }
.input-showcase .demo-row { flex-wrap: wrap; }
/* 左列内标题下与示例的间距（标题原 margin-bottom 保留即可） */

/* 默认收起字段单元：开关 + hint 竖排为一个整体（与 SelectDemo「可清除」布局一致）。 */
.config-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
/* switch 行：与 label 等高（组件统一高度）并垂直居中，使 switch 与 label 中线对齐 */
.config-field__row {
  display: flex;
  align-items: center;
  height: var(--el-component-size);
}
</style>
