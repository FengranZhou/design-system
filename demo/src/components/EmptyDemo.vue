<template>
  <section id="empty" class="demo-section">
    <h2 class="demo-section__title">Empty 空状态</h2>

    <div class="demo-block empty-showcase">
      <!-- 左侧：空状态预览，配置由右侧卡片控制 -->
      <div class="empty-preview">
        <el-empty
          :class="container === 'page' ? 'empty-page' : 'empty-block'"
          :image="current.image"
          :description="current.label"
        >
          <el-button v-if="withButton" type="primary">{{ current.action }}</el-button>
        </el-empty>
      </div>

      <!-- 右侧：配置项卡片，用「表单布局模式」实现（el-form + el-form-item），
           标签区右对齐、宽度统一、控件左对齐纵排，与设计模式-表单布局一致 -->
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="类型">
            <el-select v-model="typeKey" placeholder="选择类型" style="width: 100%;">
              <el-option
                v-for="t in types"
                :key="t.key"
                :label="t.label"
                :value="t.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="按钮">
            <el-switch v-model="withButton" />
          </el-form-item>
          <el-form-item label="级别">
            <el-radio-group v-model="container">
              <el-radio value="page">页面级</el-radio>
              <el-radio value="block">模块级</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
// 亮色空状态插画
import noData from '../../../design-spec/el-theme/assets/empty/no-data.png'
import noNetwork from '../../../design-spec/el-theme/assets/empty/no-network.png'
import noSearchResult from '../../../design-spec/el-theme/assets/empty/no-search-result.png'
import noCourse from '../../../design-spec/el-theme/assets/empty/no-course.png'
import noUser from '../../../design-spec/el-theme/assets/empty/no-user.png'
import noGraph from '../../../design-spec/el-theme/assets/empty/no-graph.png'
import noReply from '../../../design-spec/el-theme/assets/empty/no-reply.png'
import noExam from '../../../design-spec/el-theme/assets/empty/no-exam.png'
// 暗色空状态插画（与亮色同名，放 dark/ 子目录）
import noDataDark from '../../../design-spec/el-theme/assets/empty/dark/no-data.png'
import noNetworkDark from '../../../design-spec/el-theme/assets/empty/dark/no-network.png'
import noSearchResultDark from '../../../design-spec/el-theme/assets/empty/dark/no-search-result.png'
import noCourseDark from '../../../design-spec/el-theme/assets/empty/dark/no-course.png'
import noUserDark from '../../../design-spec/el-theme/assets/empty/dark/no-user.png'
import noGraphDark from '../../../design-spec/el-theme/assets/empty/dark/no-graph.png'
import noReplyDark from '../../../design-spec/el-theme/assets/empty/dark/no-reply.png'
import noExamDark from '../../../design-spec/el-theme/assets/empty/dark/no-exam.png'

// 8 种类型（文案用文件名）；image 亮色、imageDark 暗色，按主题选用
const types = [
  { key: 'data',    image: noData,         imageDark: noDataDark,         label: '无资源',       action: '立即创建' },
  { key: 'network', image: noNetwork,      imageDark: noNetworkDark,      label: '无网络',       action: '重新加载' },
  { key: 'search',  image: noSearchResult, imageDark: noSearchResultDark, label: '无搜索结果',   action: '清空筛选' },
  { key: 'course',  image: noCourse,       imageDark: noCourseDark,       label: '无课程',       action: '添加课程' },
  { key: 'user',    image: noUser,         imageDark: noUserDark,         label: '无用户',       action: '邀请成员' },
  { key: 'graph',   image: noGraph,        imageDark: noGraphDark,        label: '无图谱',       action: '去创建' },
  { key: 'reply',   image: noReply,        imageDark: noReplyDark,        label: '无回复',       action: '去回复' },
  { key: 'exam',    image: noExam,         imageDark: noExamDark,         label: '无考试/作业/测验/笔记', action: '去布置' },
]

const typeKey = ref('data')
const withButton = ref(false)
const container = ref('page')
// el-form 需要 model 对象；三个配置值即表单字段
const configForm = reactive({ typeKey, withButton, container })

// 跟随全局主题（html[data-theme="dark"]）切换亮/暗插画
const isDark = ref(false)
let themeObserver: MutationObserver | null = null
function syncTheme() {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
}
onMounted(() => {
  syncTheme()
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
})
onBeforeUnmount(() => themeObserver?.disconnect())

const currentType = computed(() => types.find(t => t.key === typeKey.value)!)
const current = computed(() => ({
  ...currentType.value,
  image: isDark.value ? currentType.value.imageDark : currentType.value.image,
}))
</script>

<style scoped>

/* 纯本页排版：左侧预览 + 右侧配置卡片 */
.empty-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.empty-preview {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
}

/* 空状态预览需并排看插画与配置，配置卡比公共层加宽一档 */
.config-card {
  width: 280px;
}

@media (max-width: 1100px) {
  .empty-showcase { flex-direction: column; }
  /* 本页覆盖了 config-card 宽度，窄屏撑满需在此重申（scoped 特异性高于公共层） */
  .config-card { width: 100%; }
}
</style>
