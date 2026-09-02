<template>
  <section id="page-ai-quiz" class="demo-section">
    <!-- 标题行按 toolbar-pattern 分支①：标题左、操作右（同其余典型页） -->
    <div class="toolbar ai-quiz-demo__toolbar">
      <div class="toolbar__left">
        <h2 class="demo-section__title">AI Quiz AI 出题</h2>
      </div>
      <div class="toolbar__right">
        <el-button @click="toggleFullscreen">
          <template #icon>
            <Minimize v-if="isFullscreen" :size="16" :stroke-width="2" />
            <Maximize v-else :size="16" :stroke-width="2" />
          </template>
          {{ isFullscreen ? '退出全屏' : '全屏查看' }}
        </el-button>
      </div>
    </div>

    <!-- 承载舞台：固定高度模拟视口；全屏态 fixed 铺满，Esc 退出（demo 看图辅助，勿抄进业务项目） -->
    <div class="ai-quiz-stage" :class="{ 'ai-quiz-stage--fullscreen': isFullscreen }">
      <!-- 本页是独立路由页而非弹窗：信息量大 + 左右并看 + 生成是多轮流程，
           dialog-pattern 四维判据全部指向「页面」。故无遮罩、无 el-dialog，
           右上角关闭＝退出本页（业务项目接 router.back()） -->
      <div class="ai-quiz">
        <!-- 页头：标题居中 + 四角星切图；关闭按钮贴右 -->
        <header class="ai-quiz__head">
          <h3 class="ai-quiz__title">
            AI 出题
            <img class="ai-quiz__title-star" :src="starIcon" alt="" />
          </h3>
          <el-tooltip content="退出 AI 出题" placement="bottom" :show-after="300">
            <el-button class="ai-quiz__close" text @click="onClose">
              <template #icon>
                <X :size="18" :stroke-width="2" />
              </template>
            </el-button>
          </el-tooltip>
        </header>

        <!-- 主体两栏：左设置定宽、右结果吃剩余。
             ⚠️ 不走比例栅格 .grid/.grid__col-*：那套是 24 列 1fr 比例列，左栏会随窗口
             一起缩水，把题型三列网格挤到裁切（见 efficiency-guide 栅格段「定宽栏例外」）。
             左栏内容宽度是固定的（表单控件 + 题型三列），故用 定宽 + 1fr。 -->
        <div class="ai-quiz__body">
          <!-- ============ 左栏：出题设置（定宽，不随窗口缩水）============ -->
          <section class="ai-quiz__panel">
            <div class="ai-quiz__panel-head">
              <h4 class="ai-quiz__panel-title">出题设置</h4>
              <span class="ai-quiz__panel-sub">填写越完整具体，AI 越懂你</span>
            </div>

            <!-- 左栏不加 scroll-fill：表单内容驱动高度、不会为空，无需撑满 -->
            <el-scrollbar class="ai-quiz__form-scroll">
              <!-- 8 个字段平铺不分组：仅超「≤7 平铺」阈值 1 项，且各字段起不出有意义的
                   分组上位词（硬切「基础信息/出题要求」属 form-pattern 明令禁止的
                   「为了分组而分组」）。表单在页面里但提交按钮是本页固定操作区，
                   故表单本体不放底部按钮 -->
              <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="auto"
                class="ai-quiz__form"
              >
                <el-form-item prop="course">
                  <template #label>
                    <span class="ai-quiz__label">课程名称<FieldHint text="出题所属的课程" /></span>
                  </template>
                  <el-input v-model="form.course" placeholder="请输入" />
                </el-form-item>

                <el-form-item>
                  <template #label>
                    <span class="ai-quiz__label">出题范围<FieldHint text="限定 AI 的取材范围，如某章节、某课件" /></span>
                  </template>
                  <!-- 「增加」入口：次按钮 + 图标（禁裸 div 自拼虚线块）。
                       图标走 #icon 插槽，取色由源头按 button 形态给（黑字按钮取 icon-2） -->
                  <el-button @click="onAddScope">
                    <template #icon>
                      <CirclePlus :size="16" :stroke-width="2" />
                    </template>
                    增加
                  </el-button>
                </el-form-item>

                <el-form-item>
                  <template #label>
                    <span class="ai-quiz__label">知识点<FieldHint text="命中的知识点，可多选" /></span>
                  </template>
                  <div class="ai-quiz__tags">
                    <!-- 已选知识点：业务组件 PickedItem（表单已选值，不是 el-tag 那种只读状态标识） -->
                    <PickedItem
                      v-for="k in form.points"
                      :key="k"
                      :label="k"
                      @remove="removePoint(k)"
                    />
                    <el-button @click="onAddPoint">
                      <template #icon>
                        <CirclePlus :size="16" :stroke-width="2" />
                      </template>
                      增加
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item>
                  <template #label>
                    <span class="ai-quiz__label">难度系数<FieldHint text="难度越高，题目越综合" /></span>
                  </template>
                  <!-- 有默认语义项 → 不可清除（select-pattern 可清除判据） -->
                  <el-select v-model="form.level" placeholder="请选择">
                    <el-option v-for="l in LEVELS" :key="l" :label="l" :value="l" />
                  </el-select>
                </el-form-item>

                <el-form-item>
                  <template #label>
                    <span class="ai-quiz__label">考核对象<FieldHint text="面向的学生群体，如大一新生" /></span>
                  </template>
                  <el-input v-model="form.target" placeholder="请输入" />
                </el-form-item>

                <el-form-item>
                  <template #label>
                    <span class="ai-quiz__label">出题要求<FieldHint text="补充说明，如侧重计算题" /></span>
                  </template>
                  <el-input
                    v-model="form.demand"
                    type="textarea"
                    :rows="3"
                    placeholder="如线性代数"
                  />
                </el-form-item>

                <el-form-item label="题型" prop="type">
                  <!-- 题型单选：选项自带图形标识、需并排比较 → 业务组件 OptionCard
                       （el-radio 无处安放图标、el-radio-button 是相连分段条，均不适配） -->
                  <OptionCard v-model="form.type" :options="QUESTION_TYPES" />
                </el-form-item>

                <el-form-item label="题目数" prop="count">
                  <!-- 默认形态（左右两侧按钮）：左栏 col-8 约 500px，放一个 120px 的数字框
                       毫不紧张，不满足 controls-position="right" 的「横向空间紧张」条件。
                       必传 min/max -->
                  <el-input-number v-model="form.count" :min="1" :max="50" />
                </el-form-item>
              </el-form>
            </el-scrollbar>

            <!-- 固定操作区：贴左栏底，跟随面板不随表单滚动 -->
            <div class="ai-quiz__submit">
              <AiButton type="primary" block :loading="generating" @click="onGenerate">
                {{ generating ? '生成中...' : '智能生成' }}
              </AiButton>
            </div>
          </section>

          <!-- ============ 右栏：智能生成结果（fill container，吃满剩余宽度）============ -->
          <section class="ai-quiz__panel">
            <div class="ai-quiz__panel-head">
              <h4 class="ai-quiz__panel-title">智能生成结果</h4>
              <span class="ai-quiz__panel-sub">对单题点击「使用」可添加到作业中；使用前，可编辑题目</span>
            </div>

            <!-- scroll-fill：滚动区撑满面板，空态（empty-page）才能在区内垂直居中 -->
            <el-scrollbar class="ai-quiz__result-scroll scroll-fill">
              <!-- ⚠ 本 demo 只展示空态：结果列表的样子随业务千差万别，演示假题目
                   对规范展示无增益，故点「生成」只走 loading → message 这条反馈链。
                   真实项目此处渲染题目列表 + 顶部「全部使用 / 清空」轻量入口，
                   组方见 references/typical-pages.md「AI 出题」段。
                   空态占满整个结果区 = 页面级档 empty-page（非区块档）；
                   必须同时传设计系统插画与档位 class，缺一即落回 EP 纸盒图 -->
              <el-empty
                class="empty-page"
                :image="noData"
                description="请在左侧填写内容并点击生成按钮"
              />
            </el-scrollbar>

            <!-- AI 免责说明：结果区底部常驻，最小字阶 + 弱化色 -->
            <footer class="ai-quiz__disclaimer">
              AI 生成的内容仅供参考，请仔细甄别
              <span class="ai-quiz__disclaimer-sep">|</span>
              <!-- 「内容举报」是免责声明句内的行内链接，与整行同为 12/18 说明文字，
                   故用 <button> + 链接样式而非 el-button text——按钮源头统一 14px
                   （body-sub、小号档未启用），塞进 12px 的说明行会比正文还大、
                   喧宾夺主。这是「纯文字入口用 el-button text」的一处例外：
                   判据是它属于一句说明文字的一部分，不是独立的操作入口。 -->
              <button type="button" class="ai-quiz__report" @click="onReport">内容举报</button>
            </footer>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 典型页面 —— AI 出题（参考讯飞小雅「AI 出题」界面）。
 * 演示「AI 生成型双栏工作页」的组织：左栏参数表单、右栏生成结果，一次填写多轮生成。
 *
 * 载体选型（dialog-pattern 四维判据）：参考图为全屏浮层，但信息量大（8 字段 + 结果列表）、
 * 左右需并看、生成是可反复的多轮流程 —— 四条全部指向「页面」，故做成独立路由页而非弹窗。
 * 弹窗三档宽度（400/640/800）都装不下这套双栏，硬塞属 dialog-pattern 反例第一条。
 *
 * 本页 scoped 只写排版留白与本页自有骨架（面板/题目条目），组件外观均在源头。
 */
import { h, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElTooltip, type FormInstance, type FormRules } from 'element-plus'
import { Maximize, Minimize, X, CirclePlus, Info } from 'lucide-vue-next'
import { AiButton, OptionCard, PickedItem } from '../../../../design-spec/components'
import noData from '../../../../design-spec/el-theme/assets/empty/no-data.png'
import starIcon from '../../assets/pages/ai-quiz/star.png'
// —— 题型图标：源项目原版切图（七款） ——
import iconSingle from '../../assets/pages/ai-quiz/single.png'
import iconMulti from '../../assets/pages/ai-quiz/multi.png'
import iconJudge from '../../assets/pages/ai-quiz/judge.png'
import iconBlank from '../../assets/pages/ai-quiz/blank.png'
import iconEssay from '../../assets/pages/ai-quiz/essay.png'
import iconMatch from '../../assets/pages/ai-quiz/match.png'
import iconOrder from '../../assets/pages/ai-quiz/order.png'

/**
 * 字段说明气泡（本页内联小组件）：label 后的 ⓘ 图标 hover 出释义。
 * 纯图标入口必须配 tooltip 给全称；每个 tooltip 必传 :show-after="300"
 * （全站统一延迟，防鼠标扫过一排图标时气泡连片弹出——延迟是 JS prop，源头 scss 兜不住）。
 */
const FieldHint = (props: { text: string }) =>
  h(
    ElTooltip,
    { content: props.text, placement: 'top', showAfter: 300 },
    { default: () => h(Info, { size: 14, strokeWidth: 2, class: 'ai-quiz__hint' }) },
  )

const QUESTION_TYPES = [
  { value: 'single', label: '单选题', icon: iconSingle },
  { value: 'multi', label: '多选题', icon: iconMulti },
  { value: 'judge', label: '判断题', icon: iconJudge },
  { value: 'blank', label: '填空题', icon: iconBlank },
  { value: 'essay', label: '简答题', icon: iconEssay },
  { value: 'match', label: '匹配题', icon: iconMatch },
  { value: 'order', label: '排序题', icon: iconOrder },
]

const LEVELS = ['难度1', '难度2', '难度3', '难度4', '难度5']

const formRef = ref<FormInstance>()
const form = reactive({
  course: '智能启思从零懂智能',
  points: ['人工智能'],
  level: '难度1',
  target: '',
  demand: '',
  type: 'single',
  count: 5,
})

// 本地可判的规则一律失焦即报；错误文案两段式（错在哪 + 怎么改）
const rules: FormRules = {
  course: [{ required: true, message: '课程名称为必填项，请输入本次出题所属课程', trigger: 'blur' }],
  type: [{ required: true, message: '题型未选择，请选择一种题型', trigger: 'change' }],
  count: [{ required: true, message: '题目数为必填项，请输入 1~50 之间的数量', trigger: 'change' }],
}

const removePoint = (k: string) => {
  form.points = form.points.filter((p) => p !== k)
}
const onAddScope = () => ElMessage({ message: '演示页：此处打开「选择出题范围」弹窗', showClose: true })
const onAddPoint = () => ElMessage({ message: '演示页：此处打开「选择知识点」弹窗', showClose: true })

// 生成：演示页只走「按钮 loading → 成功提示」这条反馈链，不渲染结果列表
const generating = ref(false)

const onGenerate = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    // 校验失败：错误已由 el-form-item 显示在对应字段下方
    return
  }
  generating.value = true
  window.setTimeout(() => {
    generating.value = false
    ElMessage({ message: '演示页：已生成，真实项目此处渲染题目列表', showClose: true })
  }, 1200)
}

const onReport = () => ElMessage({ message: '演示页：此处打开「内容举报」弹窗', showClose: true })
const onClose = () => ElMessage({ message: '演示页：真实项目此处 router.back() 退出', showClose: true })

// —— 全屏预览（同其余典型页的 demo 看图辅助）——
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    ElMessage({ message: '已进入全屏预览，按 Esc 退出', showClose: true })
  }
}
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !isFullscreen.value) return
  isFullscreen.value = false
  ;(document.activeElement as HTMLElement | null)?.blur()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
/* ===== 纯本页排版：舞台 / 留白 / 本页自有骨架，组件外观不碰 ===== */

.ai-quiz-demo__toolbar {
  margin-bottom: var(--iflyv-spacing-4);
}
.ai-quiz-demo__toolbar .demo-section__title {
  margin-bottom: 0;
}

/* 承载舞台（同其余典型页的 demo 脚手架口径） */
.ai-quiz-stage {
  height: 720px;
  border-radius: var(--iflyv-radius-lg);
  overflow: hidden;
}
.ai-quiz-stage--fullscreen {
  position: fixed;
  inset: 0;
  height: auto;
  z-index: calc(var(--iflyv-z-sticky) + 1);
  border-radius: 0;
}

/* 页面容器：页面最外层灰底（bg-page = gray-1 #F2F5F7），白面板浮其上构成纵深。
   顶部叠一张 280 高的 AI 渐变头图：横向拉伸铺满（100% 宽 × 280 固定高，不用 cover——
   cover 会按比例裁切、宽屏下把渐变裁飞），图底部自然过渡到页面灰底，故不平铺。 */
.ai-quiz {
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    url('../../assets/pages/ai-quiz/page-bg.png') top center / 100% 280px no-repeat,
    var(--iflyv-bg-page);
}

/* 字段说明图标：次级图标色阶（可点/可 hover 的辅助图标） */
.ai-quiz__hint {
  color: var(--iflyv-icon-3);
  vertical-align: middle;
}

/* —— 页头 —— */
/* 页头：定高 56（与 PageFrame 顶栏同为组件级高度，本系统不对高度设令牌，
   同源头 PageFrame 的 height: 52px 写法）；左右留白仍走令牌 */
.ai-quiz__head {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 var(--iflyv-spacing-3);
}
.ai-quiz__title {
  display: inline-flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  margin: 0;
  font: var(--iflyv-font-title-page);
  color: var(--iflyv-text-1);
}
.ai-quiz__title-star {
  width: 32px;
  height: 32px;
}
/* 关闭按钮贴右缘：绝对定位使标题保持整行居中 */
.ai-quiz__close {
  position: absolute;
  right: var(--iflyv-spacing-6);
}

/* —— 主体两栏 —— */
/* 页面内容区左右/底 24；两栏等高铺满剩余空间。
   列宽「定宽 + 1fr」而非比例栅格：左栏内容宽度固定（表单控件 + 题型三列网格），
   跟着窗口按比例缩会把题型第三列裁掉；右栏 1fr 吃满剩余，窗口变宽只有它变宽。
   水槽仍取栅格同一个令牌，与走栅格的页面保持一致的分栏间距。 */
.ai-quiz__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 440px 1fr;
  gap: var(--iflyv-spacing-3);
  padding: 0 var(--iflyv-spacing-3) var(--iflyv-spacing-3);
  align-items: stretch;
}

/* 面板：白底 + 大卡片档内边距与圆角 */
.ai-quiz__panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: var(--iflyv-spacing-4) var(--iflyv-spacing-5);
  border-radius: var(--iflyv-radius-md);
  background: var(--iflyv-bg-panel);
}

/* 面板头：标题 + 副说明同行；与下方内容走「常规标题与其下方内容」16 */
/* 面板头：标题与副说明字号差两档（18/36 vs 12/18），按基线对齐会显得副说明下坠，
   故垂直居中对齐 */
.ai-quiz__panel-head {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  margin-bottom: var(--iflyv-spacing-4);
}
/* 面板标题：页面层级链的第二级（页面 AI 出题 → 模块 出题设置/智能生成结果）→ 模块标题档 */
.ai-quiz__panel-title {
  margin: 0;
  font: var(--iflyv-font-title-module);
  color: var(--iflyv-text-1);
}
/* 面板副说明：辅助信息档（12/18）——比标题弱两级，不与标题争视线 */
.ai-quiz__panel-sub {
  font: var(--iflyv-font-body-min);
  color: var(--iflyv-text-3);
}

/* —— 左栏表单 —— */
.ai-quiz__form-scroll {
  flex: 1;
  min-height: 0;
}
.ai-quiz__label {
  display: inline-flex;
  align-items: center;
  gap: var(--iflyv-spacing-1);
}
/* 「增加」入口与知识点标签同行排布 */
.ai-quiz__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--iflyv-spacing-2);
}
/* 提交区：贴面板底，与表单间距走「模块之间」；主按钮撑满面板宽度作页面主操作 */
.ai-quiz__submit {
  display: flex;
  margin-top: var(--iflyv-spacing-4);
}

/* —— 右栏结果 —— */
.ai-quiz__result-scroll {
  flex: 1;
  min-height: 0;
}

/* 免责说明：结果区底部常驻，最小字阶 + 弱化色 */
.ai-quiz__disclaimer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--iflyv-spacing-2);
  margin-top: var(--iflyv-spacing-3);
  font: var(--iflyv-font-body-min);
  color: var(--iflyv-text-4);
}
.ai-quiz__disclaimer-sep {
  color: var(--iflyv-border-default);
}
/* 句内链接：裸 button 去掉浏览器默认样式，字号行高继承免责行（12/18），
   靠下划线而非字号/颜色表达可点 */
.ai-quiz__report {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--iflyv-text-3);
  text-decoration: underline;
  cursor: pointer;
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}
.ai-quiz__report:hover {
  color: var(--iflyv-text-1);
}
</style>
