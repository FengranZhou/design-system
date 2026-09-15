<template>
  <section id="page-public-info" class="demo-section">
    <!-- 标题行按 toolbar-pattern 分支①：标题左、操作右。
         全屏是「看 demo 的辅助手段」，不是页面本身的能力，故只做在本页。 -->
    <div class="toolbar public-info-demo__toolbar">
      <div class="toolbar__left">
        <h2 class="demo-section__title">Public 公开信息设置</h2>
      </div>
      <div class="toolbar__right">
        <!-- 次按钮（默认款）：带文字标签，不再是纯图标入口，故无需 tooltip 补全称 -->
        <el-button @click="toggleFullscreen">
          <template #icon>
            <Minimize v-if="isFullscreen" :size="16" :stroke-width="2" />
            <Maximize v-else :size="16" :stroke-width="2" />
          </template>
          {{ isFullscreen ? '退出全屏' : '全屏查看' }}
        </el-button>
      </div>
    </div>

    <!-- 承载舞台：固定高度模拟视口（同 PageFrameDemo 的看图辅助，纯本页排版）。
         全屏态 = fixed 铺满视口（浏览器界面维持原状），Esc 可退出。 -->
    <div class="public-info-stage" :class="{ 'public-info-stage--fullscreen': isFullscreen }">
      <PageFrame
        v-model:active="activeKey"
        :menus="menus"
        :course="course"
        avatar-role="teacher-male"
        user-name="王老师"
      >
        <!-- 页面级 tab 工具栏放 #page-header：在滚动区之外、始终可见，
             滚动条轨道于是只覆盖下方真正会滚的内容。 -->
        <template #page-header>
          <div class="toolbar public-info__head">
            <div class="toolbar__left">
              <el-tabs v-model="activeTab" class="tabs-page">
                <el-tab-pane label="课程概述" name="overview" />
                <el-tab-pane label="教学团队" name="team" />
                <el-tab-pane label="课程框架" name="framework" />
                <el-tab-pane label="课程图谱" name="graph" />
                <el-tab-pane label="AI特色" name="ai" />
              </el-tabs>
            </div>
          </div>
        </template>

        <div class="public-info">

          <!-- AI 特色 tab（演示主体） -->
          <template v-if="activeTab === 'ai'">
            <!-- AI 特色展示横幅：渐变底 + 3D 四角星均为用户提供切图（页面装饰资产，非组件外观） -->
            <div class="ai-banner">
              <img class="ai-banner__star" :src="aiStar" alt="" />
              <span class="ai-banner__title">AI 特色展示</span>
              <el-switch v-model="aiEnabled" />
            </div>

            <div class="info-card info-card--bleed">
              <h4 class="info-card__title">简介文案</h4>
              <div class="info-card__panel">
                本课程将构建“师–生–AI”三元一体的全新教学模式，秉承以人为本的思维，激发学生学习过程中的能动性和责任心，帮助学生站在
                AI 肩膀上开展意义学习和深度学习，支持文字+图片的混合模式。本课程将构建“师–生–AI”三元一体的全新教学模式，秉承以人为本的思维，激发学生学习过程中的能动性和责任心，帮助学生站在
                AI 肩膀上开展意义学习和深度学习，支持文字+图片的混合模式。
              </div>
            </div>

            <div v-for="card in featureCards" :key="card.title" class="info-card">
              <h4 class="info-card__title">{{ card.title }}</h4>
              <p class="info-card__desc">
                {{ card.desc }}
                <el-tag class="el-tag--outline"><Info :size="12" :stroke-width="2" />来源</el-tag>
              </p>
            </div>

            <!-- 页面级表单操作区：主按钮贴左（主按钮贴边原则——左对齐容器主按钮贴左缘） -->
            <div class="public-info__actions">
              <el-button type="primary">编辑</el-button>
              <el-button>预览</el-button>
            </div>
          </template>

          <!-- 其余 tab 不在演示范围：空状态占据整个页面内容区 → 页面级档 empty-page
               （档位判据：整页工作区 = 页面级 / 页内某卡片区块 = 模块级；插画 + 档位 class 缺一即落回 EP 默认） -->
          <el-empty
            v-else
            class="empty-page"
            :image="isDark ? noDataDark : noData"
            description="该 Tab 内容不在本页演示范围"
          />
        </div>
      </PageFrame>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 典型页面 —— 公开信息设置（参考讯飞小雅「发布流程 / 公开信息设置」页）。
 * 演示如何用设计系统组织一个真实业务页：
 *   PageFrame 整页骨架 + .tabs-page 页面级 tab + bg-card 内容卡 +
 *   AI 渐变横幅（用户提供切图）+ 主按钮贴左的页面级操作区。
 * 本页仅做典型页面展示，所有组件外观均来自源头，本页 scoped 只写排版留白。
 */
import { h, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Maximize, Minimize, Info } from 'lucide-vue-next'
import NavIcon from '../biz/NavIcon.vue'
import aiSettingSvg from '../../assets/nav-icons/ai-setting.svg?raw'
import aiSettingActiveSvg from '../../assets/nav-icons/ai-setting-active.svg?raw'
import { PageFrame, type PageFrameMenuGroup, type PageFrameCourse } from '../../../../design-spec/components'
import aiStar from '../../assets/pages/ai-star-3d.png'
import noData from '../../../../design-spec/el-theme/assets/empty/no-data.png'
import noDataDark from '../../../../design-spec/el-theme/assets/empty/dark/no-data.png'

// —— 框架数据（导航不沿用参考图：组标题「典型页面」+ 单项「公开信息设置」）——
const menus: PageFrameMenuGroup[] = [
  {
    title: '典型页面',
    // 图标沿用 PageFrameDemo 的双态切图机制（默认描边 / 选中实心，NavIcon 接住 active）
    items: [{ key: 'public-info', label: '公开信息设置', icon: (props: Record<string, unknown>) => h(NavIcon, { normal: aiSettingSvg, activeSvg: aiSettingActiveSvg, ...props }) }],
  },
]
const activeKey = ref('public-info')

// 课程卡沿用 PageFrameDemo 同款数据
const course: PageFrameCourse = {
  name: '《智能启思从零懂智能》',
  meta: ['2023年春', '全网公开', '教务开课'],
  // 卡片右上「更多」下拉：框架一项都不写死，由业务方按自身功能传入
  menus: [
    { key: 'detail', label: '查看课程首页' },
    { key: 'setting', label: '课程设置' },
    { key: 'qrcode', label: '打开二维码' },
  ],
}

// —— 页面内容数据 ——
const activeTab = ref('ai')
const aiEnabled = ref(true)

const featureCards = [
  { title: 'AI助学', desc: '已配置【小雅助学】，关联 5 个知识点' },
  { title: '知识库', desc: '5 个知识库，4 份资源，3 个问答对' },
  { title: '智能体', desc: '已选 4 / 7 个智能体' },
]

// —— 跟随全局主题切换空状态亮/暗插画 ——
const isDark = ref(false)
let themeObserver: MutationObserver | null = null
function syncTheme() {
  isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
}

// —— 全屏预览（仅 demo 的看图辅助）——
// 不用原生 Fullscreen API：那会连浏览器界面一起隐藏，这里只要铺满视口。
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // 全屏后按钮被盖住，Esc 是唯一出口，进入时必须告知
  if (isFullscreen.value) {
    ElMessage({ message: '已进入全屏预览，按 Esc 退出', showClose: true })
  }
}
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !isFullscreen.value) return
  isFullscreen.value = false
  // 断掉按钮残留焦点，避免 Esc 切到键盘模态后凭空出现 focus-visible 描边
  ;(document.activeElement as HTMLElement | null)?.blur()
}

onMounted(() => {
  syncTheme()
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  themeObserver?.disconnect()
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* ===== 纯本页排版：舞台 / 留白 / 页面装饰资产，不碰任何组件外观 ===== */

.public-info-demo__toolbar {
  margin-bottom: var(--iflyv-spacing-4);
}
.public-info-demo__toolbar .demo-section__title {
  margin-bottom: 0;
}

/* 承载舞台：固定高度模拟真实视口；框架自带 bg-page 灰底，圆角裁掉溢出直角 */
.public-info-stage {
  height: 640px;
  border-radius: var(--iflyv-radius-lg);
  overflow: hidden;
}

/* 全屏态：fixed 铺满视口。层级取 sticky+1（页面级固定框架，压过 demo 吸顶导航即可；
   不取 dialog 档——EP Message 的行内 z-index 自 2000 起，遮罩过高会盖住提示） */
.public-info-stage--fullscreen {
  position: fixed;
  inset: 0;
  height: auto;
  z-index: calc(var(--iflyv-z-sticky) + 1);
  border-radius: 0;
}

/* 页面内容区：左右/底部留白一次给全，卡片纵向排布 */
/* 撑满 PageFrame 内容区，使不满一屏的内容（如整页空态）能拿到高度基准、
   在内容区内垂直居中；内容超出时照常向下撑开并滚动 */
/* 内容块之间的间距。⚠ 两处限定各有原因：
   · 「前一个不是工具栏」——工具栏与其下方内容的间距已由源头 .toolbar 的
     padding-block-end 给出，此处再加会叠成双倍。
   · 「自己不是操作区」——操作区靠 margin-top: auto 推到底部，这里不能占用它的 margin。
     必须在**本选择器**排除，不能靠操作区自己写 margin 覆盖：本选择器特异性 (0,2,0)
     （.public-info + :not(.toolbar)）高于 .public-info__actions 的 (0,1,0)，
     scoped 属性给两者各加 1 后大小关系不变，写在那边会被静默忽略。 */
.public-info > :not(.toolbar) + :not(.public-info__actions) {
  margin-top: var(--iflyv-spacing-4);
}
.public-info {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  box-sizing: border-box;
  /* 上下留白由源头 .toolbar 自带（页面级工具栏内边距归工具栏自己），
     容器只给左右与底部。⚠ 不要在此写 gap——会与工具栏内边距叠加成双倍。 */
  padding: 0 var(--iflyv-spacing-6) var(--iflyv-spacing-6);
}

/* AI 特色展示横幅：渐变底为用户提供切图（本页装饰资产） */
.ai-banner {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  padding: var(--iflyv-spacing-3) var(--iflyv-spacing-4);
  border-radius: var(--iflyv-radius-sm);
  background: url('../../assets/pages/ai-feature-banner-bg.png') center / cover no-repeat;
}
.ai-banner__star {
  width: 32px;
  height: 32px;
}
.ai-banner__title {
  flex: 1;
  font: var(--iflyv-font-title-regular);
  /* 切图底色恒定为浅色、不随主题翻转 → 恒定深文字（暗色下用 text-1 会翻浅、读不出来） */
  color: var(--iflyv-text-on-light);
}

/* 信息卡：bg-card 灰卡承载各内容模块 */
.info-card {
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-5);
  border-radius: var(--iflyv-radius-md);
  background: var(--iflyv-bg-card);
}
/* 含通栏出血面板的卡：底部内缩与面板两侧内缩一致（spacing-1 = 4） */
.info-card--bleed {
  padding-bottom: var(--iflyv-spacing-1);
}
.info-card__title {
  margin: 0;
  font: var(--iflyv-font-title-regular);
  color: var(--iflyv-text-1);
}
/* 简介长文案：白底内衬面板 + 多行正文档 */
.info-card__panel {
  margin-top: var(--iflyv-spacing-3);
  /* 嵌套在大卡片(16/20)内的子容器 → 按嵌套收一档取小卡片档(12/16)。
     注意判据是容器体量，不是"用了 bg-panel 底色就算面板档"（面板档指页面级底板） */
  padding: var(--iflyv-spacing-3) var(--iflyv-spacing-4);
  /* 通栏出血：面板向两侧延伸至距卡缘 spacing-1(4)，随卡片左右内边距(spacing-5)联动 */
  margin-inline: calc(var(--iflyv-spacing-1) - var(--iflyv-spacing-5));
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-bg-panel);
  font: var(--iflyv-font-body-primary-multiline);
  color: var(--iflyv-text-1);
}
.info-card__desc {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  margin: var(--iflyv-spacing-2) 0 0;
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-3);
}

/* 页面级操作区：主按钮贴左；按钮间距一律父容器 flex+gap（源头已清零 EP 相邻 margin）。
   吸底：内容超出一屏时 sticky 贴住滚动容器底缘（在流内、随内容滚动，非常驻悬浮条）；
   白底内衬遮住从其下滚过的卡片。

   ⚠ 贴底靠 margin-top: auto，**不是**靠 sticky：sticky 只在元素会被滚出视口时才约束它，
     内容不满一屏时元素本就完整可见、sticky 不产生任何位移，按钮会停在末张卡片之后。
     纵向 flex 里由 auto margin 吸收底部剩余空间才真正推到底；内容溢出时剩余空间为 0、
     auto 收敛成 0，按钮回到流内紧随内容，再由 sticky 接管吸底——两态由此统一。
     （前提：父级 .public-info 的 min-height:100% 有确定基准，由 PageFrame 滚动区的
     scroll-fill 保证 wrap/view 满高，业务层不必再传导高度。）

   ⚠ 上下都要内衬（白底才能盖住从其下滚过的卡片），但**只有下方能用负 margin 抵消**：
     上方的块间距改由自身 padding-top 提供（同为 spacing-4，视觉位置不变），
     把 margin-top 腾给 auto；兄弟间距规则已在其自身选择器里排除本元素。 */
.public-info__actions {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: var(--iflyv-spacing-3);
  background: var(--iflyv-bg-panel);
  /* 上：auto 吸收底部剩余空间，把自己推到容器底部（内容溢出时收敛为 0）；
     上方间距改由下面的 padding-top 提供，白底也随之覆盖到位 */
  margin-top: auto;
  padding-top: var(--iflyv-spacing-4);
  /* 下：内衬 + 等量负 margin 相抵，未吸底时流内几何与无内衬一致。
     ⚠ 取值必须与容器 .public-info 的 padding-bottom 同为 spacing-6——两态的
     「按钮到底缘」读的是**不同来源**：吸底态 bottom:0 把自身边框盒钉在滚动视口底缘，
     可见间距 = 自身 padding-bottom；未吸底（滚到底）时元素回到流内，负 margin 抵掉
     自身内衬，可见间距 = 容器 padding-bottom。二者不等就会在滚到底那一刻跳动
     （曾为 12 / 24，滚到底跳 12px）。改容器底部留白时这里要一并改。 */
  padding-bottom: var(--iflyv-spacing-6);
  margin-bottom: calc(-1 * var(--iflyv-spacing-6));
}
</style>
