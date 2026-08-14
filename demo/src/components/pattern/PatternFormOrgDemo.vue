<template>
  <section id="pattern-form-org" class="demo-section">
    <h2 class="demo-section__title">Form 表单组织</h2>

    <!-- 配置项卡片：统管下方模式规则 + 标准范例。
         本身即用「表单布局模式」实现（标签+控件 → el-form），自我印证。 -->
    <div class="pattern-card">
      <p class="pattern-card__title">配置项</p>
      <el-form :model="configForm" label-width="auto">
        <el-form-item label="分组">
          <el-radio-group v-model="grouped">
            <el-radio :value="false">不需要分组（≤ 7 项）</el-radio>
            <el-radio :value="true">需要分组（&gt; 7 项）</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- ≤7 不分组，后两问都无从谈起 → 整项不渲染，不占位 -->
        <template v-if="grouped">
          <el-form-item label="分布">
            <el-radio-group v-model="split">
              <el-radio value="anchor">同屏对照</el-radio>
              <el-radio value="step">先后顺序</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="组形式">
            <el-radio-group v-model="boundary">
              <el-radio value="title">轻量分隔（默认）</el-radio>
              <el-radio value="card">卡片分隔（组长或不同类）</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
      </el-form>
    </div>

    <!-- 上块：模式规则 —— 决策链是主角 -->
    <div class="pattern-card">
      <p class="pattern-card__title">模式规则</p>
      <p class="pattern-card__desc">
        三步决策链：要不要分组？ → 组怎么分布？ → 分组表现形式是？
      </p>

      <!-- 决策链：① 要不要分组 → ② 组怎么分布。静态展示全部选项，不跟配置项联动 -->
      <div class="chain">
        <!-- 第 ① 步 -->
        <div class="chain__step">
          <div class="chain__head">
            <span class="chain__tag">① 要不要分组？</span>
          </div>
          <div class="chain__opts">
            <div v-for="o in scaleOpts" :key="o.key" class="opt">
              <span class="opt__name">
                {{ o.name }}<span class="opt__cond">（{{ o.cond }}）</span>
              </span>
              <span class="opt__note">{{ o.note }}</span>
            </div>
          </div>
        </div>

        <!-- 第 ② 步 -->
        <div class="chain__step">
          <div class="chain__head">
            <span class="chain__tag">② 组怎么分布？</span>
          </div>
          <div class="chain__opts">
            <div v-for="o in splitOpts" :key="o.key" class="opt">
              <span class="opt__name">
                {{ o.name }}<span class="opt__cond">（{{ o.cond }}）</span>
              </span>
              <span class="opt__note">{{ o.note }}</span>
            </div>
          </div>
        </div>

        <!-- 第 ③ 步：只在「同屏」下才需要——一个区域内多组并列才有边界要标 -->
        <div class="chain__step">
          <div class="chain__head">
            <span class="chain__tag">③ 分组表现形式是？</span>
            <span class="chain__note">一屏内同时出现多组时才需要</span>
          </div>
          <div class="chain__opts">
            <div v-for="o in boundaryOpts" :key="o.key" class="opt">
              <span class="opt__name">
                {{ o.name }}<span class="opt__cond">（{{ o.cond }}）</span>
              </span>
              <span class="opt__note">{{ o.note }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 下块：标准范例 —— 决策链跑完之后的结果 -->
    <div class="pattern-card">
      <p class="pattern-card__title">标准范例</p>

      <!-- ≤7 项：不分组，一列平铺到底。② 不用问 -->
      <div v-if="!grouped" class="sample">
        <el-form :model="form" label-width="auto" class="sample__form">
          <el-form-item v-for="f in fewFields" :key="f.prop" :label="f.label">
            <component :is="f.comp" v-model="form[f.prop]" v-bind="f.attrs" :style="f.width" />
          </el-form-item>
          <el-form-item label=" ">
            <!-- 页面级表单：按钮组左对齐 → 主按钮贴左缘（主按钮贴边原则） -->
            <el-button type="primary">提交</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 拆开 = 分步。步骤名由 StepBar 给出，容器内不再重复；
           但每步内部要重新走一遍判断——本范例每步 8 项（>7）故拆 2 个子组，
           子组各自带标题，此时才谈得上组形式（层级不同，不算与步骤名重复）。 -->
      <div v-else-if="split === 'step'" class="sample">
        <StepBar :steps="groups.map(g => g.title)" :current="stepCurrent" />
        <div
          v-for="sub in groups[stepCurrent - 1].subs" :key="sub.key"
          class="sample__sec" :class="{ 'sample__sec--card': boundary === 'card' }"
        >
          <p class="sample__sec-title">{{ sub.title }}</p>
          <el-form :model="form" label-width="auto">
            <el-form-item v-for="f in sub.fields" :key="f.prop" :label="f.label">
              <component :is="f.comp" v-model="form[f.prop]" v-bind="f.attrs" :style="f.width" />
            </el-form-item>
            <!-- 小标题分段时各组同处一个连续版面，操作区跟在末组表单里、
                 与字段共用 label 列，保持左缘对齐 -->
            <el-form-item v-if="boundary !== 'card' && sub.key === lastSubKey" label=" ">
              <!-- 方向性按钮：不适用主按钮贴边原则，「下一步」恒在右 -->
              <el-button v-if="stepCurrent > 1" @click="stepCurrent--">上一步</el-button>
              <el-button v-if="stepCurrent < groups.length" type="primary" @click="stepCurrent++">下一步</el-button>
              <el-button v-else type="primary">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 卡片分组时操作区必须在所有卡片之外：提交针对整个表单、不属于任何一张卡片。
             与卡片左缘对齐 -->
        <div v-if="boundary === 'card'" class="sample__actions">
          <el-button v-if="stepCurrent > 1" @click="stepCurrent--">上一步</el-button>
          <el-button v-if="stepCurrent < groups.length" type="primary" @click="stepCurrent++">下一步</el-button>
          <el-button v-else type="primary">提交</el-button>
        </div>
      </div>

      <!-- 同屏 = 锚点：各组同处一页、一次提交，可来回对照。
           各组并列在一屏内，必须各自带组标题（否则分不清边界）。
           direction 只用 horizontal——竖版源头未适配（见 component-interaction.md Anchor 段）。 -->
      <div v-else class="sample">
        <!-- 滚动容器不是 window，故必须传 container 指向 scrollbar 的 wrap
             （见 component-interaction.md Anchor 段的交叉盲区）。
             container 要等 scrollbar 挂载才拿得到，首帧为 undefined；EP 内部
             watch(props.container) 会在拿到后自行重新绑定，无需手动重建。
             select-scroll-top：EP 默认在容器回到顶部时不高亮任何项，本例首项
             即在顶部，故须开启，否则回顶后锚点全部失去高亮。
             @click 只做 preventDefault：el-anchor-link 渲染的是真 <a href="#…">，
             EP 自己不拦默认行为，浏览器原生锚跳会把整个模块滚进视口（页面级滚动）。
             拦掉之后容器内滚动与高亮仍由 EP 负责，不要自己接管。 -->
        <el-anchor
          :container="anchorContainer"
          direction="horizontal"
          :offset="0"
          select-scroll-top
          @click="onAnchorClick"
        >
          <el-anchor-link
            v-for="g in groups" :key="g.key"
            :href="`#sec-${g.key}`" :title="g.title"
          />
        </el-anchor>
        <el-scrollbar ref="anchorScrollRef" height="360px" class="sample__scroll">
          <div
            v-for="g in groups" :id="`sec-${g.key}`" :key="g.key"
            class="sample__sec" :class="{ 'sample__sec--card': boundary === 'card' }"
          >
            <p class="sample__sec-title">{{ g.title }}</p>
            <el-form :model="form" label-width="auto">
              <el-form-item v-for="f in flatFields(g)" :key="f.prop" :label="f.label">
                <component :is="f.comp" v-model="form[f.prop]" v-bind="f.attrs" :style="f.width" />
              </el-form-item>
              <!-- 小标题分段时各组同处一个连续版面，操作区跟在末组表单里 -->
              <el-form-item v-if="boundary !== 'card' && g.key === groups[groups.length - 1].key" label=" ">
                <el-button type="primary">提交</el-button>
                <el-button>取消</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 卡片分组时操作区在所有卡片之外（一次提交针对全部卡片），
               但仍在滚动区之内——放到 scrollbar 外会变成吸底工具条，
               那是另一种形态，不是本例要讲的。 -->
          <div v-if="boundary === 'card'" class="sample__actions">
            <el-button type="primary">提交</el-button>
            <el-button>取消</el-button>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed, nextTick, watch } from 'vue'
import { ElInput, ElSelect, ElDatePicker, ElInputNumber, ElScrollbar } from 'element-plus'
import { StepBar } from '../../../../design-spec/components'

// —— 配置项 ——
// ① 要不要分组（≤7 不分组）；② 分组后这些组怎么分布（同屏 / 拆开）。
// ② 依赖 ①：不分组就只有 1 组，没有"这些组怎么分布"可言。
const grouped = ref(true)
const split = ref('step')
// ③ 组边界怎么标：只在同屏（锚点）下有意义
const boundary = ref('title')

const configForm = reactive({ grouped, split, boundary })

// ① 要不要分组：按字段数（阈值与 form-pattern.md §8① 一致）
const scaleOpts = [
  { key: 'few',     cond: '≤ 7 项', name: '不分组', note: '一列平铺到底，②、③ 不用问' },
  { key: 'grouped', cond: '> 7 项', name: '分组',   note: '按必填/相关性切成若干组' },
]

// ② 这些组怎么分布：按"要不要来回对照"（判据与 form-pattern.md §8② 一致）
const splitOpts = [
  { key: 'anchor', cond: '要对照 · 同屏',    name: 'el-anchor 锚点', note: '各组同处一页、一次提交' },
  { key: 'step',   cond: '不用 · 有先后顺序', name: 'StepBar 分步',   note: '分步推进，建议 ≤ 3 步' },
]

// ③ 组边界怎么标（判据与 form-pattern.md §8③ 一致）
const boundaryOpts = [
  { key: 'title', cond: '默认',            name: '小标题分段', note: '轻量分隔，给用户休息点' },
  { key: 'card',  cond: '单组 > 5 项 或 各组不同类', name: '每组套卡片', note: '边界更明确，层级更强' },
]

// —— 标准范例：新建课程（9 字段 → 三组）——
const w = {
  short: 'width: 200px',   // 固定格式：日期、人数上限
  mid:   'width: 320px',   // 短文本：课程名称
  full:  'width: 100%',    // 长度不可预期
}
/** 字段配置：comp/attrs 跨组件异构（Input/Select/DatePicker/InputNumber），
 *  统一标成宽松类型，避免 TS 把各组件 props 交叉推断成不可满足的类型 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldDef = { prop: string; label: string; comp: any; attrs: Record<string, any>; width: string }

/** 每个分组内部可再含若干子组。
 *  ⚠️ 子组是"这一步内部又要不要分组"的产物——每步都要重新走一遍判断：
 *  该步字段 >7 才需要拆子组，≤7 就直接平铺。本范例每步 8 项、拆 2 个子组，
 *  正是"一步内含多组"的场景，此时才谈得上组形式（轻量分隔 / 卡片分隔）。 */
const groups: { key: string; title: string; subs: { key: string; title: string; fields: FieldDef[] }[] }[] = [
  {
    key: 'basic', title: '基本信息',
    subs: [
      {
        key: 'basic-core', title: '课程标识',
        fields: [
          { prop: 'name',  label: '课程名称', comp: ElInput,  attrs: { placeholder: '请输入课程名称' }, width: w.mid },
          { prop: 'code',  label: '课程编号', comp: ElInput,  attrs: { placeholder: '请输入课程编号' }, width: w.short },
          { prop: 'subject', label: '所属学科', comp: ElSelect, attrs: { placeholder: '请选择学科' }, width: w.mid },
          { prop: 'credit', label: '学分',     comp: ElInputNumber, attrs: { min: 1, max: 10 }, width: w.short },
        ],
      },
      {
        key: 'basic-desc', title: '课程描述',
        fields: [
          { prop: 'intro',   label: '课程简介', comp: ElInput, attrs: { type: 'textarea', rows: 3, placeholder: '请输入课程简介' }, width: w.full },
          { prop: 'target',  label: '教学目标', comp: ElInput, attrs: { type: 'textarea', rows: 2, placeholder: '请输入教学目标' }, width: w.full },
          { prop: 'outline', label: '课程大纲', comp: ElInput, attrs: { type: 'textarea', rows: 2, placeholder: '请输入课程大纲' }, width: w.full },
          { prop: 'book',    label: '指定教材', comp: ElInput, attrs: { placeholder: '请输入教材名称' }, width: w.mid },
        ],
      },
    ],
  },
  {
    key: 'schedule', title: '教学安排',
    subs: [
      {
        key: 'schedule-time', title: '时间安排',
        fields: [
          { prop: 'start', label: '开课日期', comp: ElDatePicker, attrs: { type: 'date', placeholder: '选择日期' }, width: w.short },
          { prop: 'end',   label: '结课日期', comp: ElDatePicker, attrs: { type: 'date', placeholder: '选择日期' }, width: w.short },
          { prop: 'weekday', label: '上课星期', comp: ElSelect,   attrs: { placeholder: '请选择星期' }, width: w.mid },
          { prop: 'period',  label: '上课节次', comp: ElSelect,   attrs: { placeholder: '请选择节次' }, width: w.mid },
        ],
      },
      {
        key: 'schedule-place', title: '地点与形式',
        fields: [
          { prop: 'building', label: '教学楼', comp: ElSelect, attrs: { placeholder: '请选择教学楼' }, width: w.mid },
          { prop: 'room',     label: '教室',   comp: ElInput,  attrs: { placeholder: '请输入教室号' }, width: w.short },
          { prop: 'mode',     label: '授课形式', comp: ElSelect, attrs: { placeholder: '请选择形式' }, width: w.mid },
          { prop: 'liveUrl',  label: '直播链接', comp: ElInput,  attrs: { placeholder: '线上课填写' }, width: w.full },
        ],
      },
    ],
  },
  {
    key: 'student', title: '学生管理',
    subs: [
      {
        key: 'student-scope', title: '选课范围',
        fields: [
          { prop: 'limit',  label: '人数上限', comp: ElInputNumber, attrs: { min: 1, max: 200 }, width: w.short },
          { prop: 'grade',  label: '面向年级', comp: ElSelect,      attrs: { placeholder: '请选择年级' }, width: w.mid },
          { prop: 'major',  label: '面向专业', comp: ElSelect,      attrs: { placeholder: '请选择专业' }, width: w.mid },
          { prop: 'preReq', label: '先修要求', comp: ElInput,       attrs: { placeholder: '选填' }, width: w.mid },
        ],
      },
      {
        key: 'student-assess', title: '考核方式',
        fields: [
          { prop: 'examType',  label: '考核形式', comp: ElSelect,      attrs: { placeholder: '请选择形式' }, width: w.mid },
          { prop: 'passScore', label: '及格分数', comp: ElInputNumber, attrs: { min: 0, max: 100 }, width: w.short },
          { prop: 'attendPct', label: '平时占比', comp: ElInputNumber, attrs: { min: 0, max: 100 }, width: w.short },
          { prop: 'remark',    label: '备注',     comp: ElInput,       attrs: { type: 'textarea', rows: 2, placeholder: '选填' }, width: w.full },
        ],
      },
    ],
  },
]

/** 把一个分组的所有子组字段拍平（同屏形态下按组渲染，不再显示子组标题） */
const flatFields = (g: (typeof groups)[number]) => g.subs.flatMap(s => s.fields)

/** 全部字段 */
const allFields = groups.flatMap(flatFields)

// 表单数据由字段配置自动生成，避免手写 key 与配置脱节
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 字段类型异构，v-model 需具体类型
const form = reactive<Record<string, any>>(
  Object.fromEntries(allFields.map(f => [f.prop, f.comp === ElInputNumber ? 1 : ''])),
)

// ≤7 项的范例：取前 6 个字段平铺（不分组）
const fewFields = allFields.slice(0, 6)

const stepCurrent = ref(1)
// 小标题分段时，操作区跟在当前步「末组」的表单里
const lastSubKey = computed(() => {
  const subs = groups[stepCurrent.value - 1].subs
  return subs[subs.length - 1].key
})

// el-anchor 的 container：内容区被 el-scrollbar 包裹时，默认监听 window 会完全失效，
// 必须指向 scrollbar 的 wrap 元素（见 component-interaction.md Anchor 段的交叉盲区）
const anchorScrollRef = ref<InstanceType<typeof ElScrollbar>>()
const anchorContainer = ref<HTMLElement>()
// container 要等 scrollbar 挂载才拿得到，首帧必为 undefined；
// EP 内部 watch(props.container) 会在拿到后自行重新绑定滚动监听，无需手动重建组件。

/** 只阻止浏览器的原生锚跳，不接管滚动。
 *  el-anchor-link 渲染的是真 <a href="#…">，EP 的 handleClick 不调 preventDefault，
 *  于是浏览器会把 #sec-xxx 滚进视口——那是页面级滚动，会把整个模块顶走。
 *  拦掉默认行为后，EP 的 animateScrollTo 只写 container.scrollTop，滚动被限制在容器内；
 *  高亮与 marker 定位同样仍归 EP，切勿在此自算 active（见 component-interaction.md Anchor 段）。 */
const onAnchorClick = (e: MouseEvent) => {
  e.preventDefault()
}
watch(split, async (v) => {
  if (v !== 'anchor') return
  // el-anchor 在 onMounted 里会读 window.location.hash，命中就跳过去：
  //   const hash = decodeURIComponent(window.location.hash)
  //   if (getElement(hash)) scrollTo(hash)
  // 本 demo 的侧边导航是原生 <a href="#xxx">，地址栏里存着上次点的章节 id
  // （如 #form-layout），于是切到「同屏对照」一挂载就跳到那个章节去了。
  // 挂载前清掉 hash——侧边栏高亮由滚动位置算，不依赖 hash，清掉不影响导航。
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
  await nextTick()
  anchorContainer.value = anchorScrollRef.value?.wrapRef ?? undefined
}, { immediate: true })
</script>

<style scoped>
/* 纯本页排版，全部走令牌；不覆盖任何组件外观 */

/* —— 决策链：怎么分 → 怎么摆，静态展示 —— */
.chain {
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-4);
  margin-top: var(--iflyv-spacing-4);
}
.chain__step {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-lg);
}

/* 步骤头：区名胶囊（与 PatternFormDemo 的 .zone__tag 同款） */
.chain__head {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-3);
  margin-bottom: var(--iflyv-spacing-4);
}
/* 适用条件说明：跟在胶囊右侧，弱化 */
.chain__note {
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
.chain__tag {
  display: inline-block;
  padding: var(--iflyv-spacing-1) var(--iflyv-spacing-3);
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-info-bg);
  color: var(--iflyv-info-primary);
  font: var(--iflyv-font-title-component);
}

/* 选项列表：两张卡片竖排后各自占满宽度，选项改横排三等分，
   否则单个条目会被拉得很长、可读性差 */
.chain__opts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--iflyv-spacing-3);
}
.opt {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-1);
  padding: var(--iflyv-spacing-3);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
/* 条件跟在名称后面的括号里，用普通文字而非胶囊——
   它是对名称的限定说明，不是需要单独扫读的标签 */
.opt__cond {
  color: var(--iflyv-text-3);
  font-weight: var(--iflyv-font-weight-regular);
}
.opt__name {
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
.opt__note {
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}

/* 贯穿全链的硬约束 */
.chain__rules {
  margin: var(--iflyv-spacing-4) 0 0;
  padding-left: var(--iflyv-spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--iflyv-spacing-2);
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
/* 硬约束是整段陈述，不做词级加重——避免通篇高亮反而失去重点 */
.chain__rules strong {
  color: inherit;
  font-weight: var(--iflyv-font-weight-regular);
}

/* —— 标准范例 —— */
.sample { margin-top: var(--iflyv-spacing-4); }
.sample__form { margin-top: var(--iflyv-spacing-6); max-width: 560px; }

/* 锚点形态：顶部横向目录 + 下方滚动区 */
.sample__scroll { margin-top: var(--iflyv-spacing-4); }
.sample__sec + .sample__sec { margin-top: var(--iflyv-spacing-8); }
.sample__sec { margin-top: var(--iflyv-spacing-4); }

/* 操作区独立成表单：与分组容器分离，按钮不进卡片内 */

/* 卡片分组（③ = 单组 >5 项 或 各组不同类）：每组套白卡片，边界比纯小标题更明确。
   用 bg-panel 白底 —— 范例区外层是 bg-card 浅灰，白卡浮其上才有纵深；
   若卡片也取 bg-card 会与底同色、边界消失（同「背景色纵深关系」那条）。 */
.sample__sec--card {
  padding: var(--iflyv-spacing-5);
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-md);
}
/* 卡片形态下组间距收紧：卡片自身的边界已承担分隔 */
.sample__sec--card + .sample__sec--card { margin-top: var(--iflyv-spacing-4); }

/* 组标题是「模块级」而非组件级：它统领一整组字段，
   用 title-component（14px）会与字段 label 同字号、压不住 */
.sample__sec-title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-module);
}

/* 操作区：在所有卡片之外，但仍在滚动区内（放到区外会变成吸底工具条）。
   不加缩进 —— 与卡片的外左缘对齐 */
.sample__actions {
  display: flex;
  gap: var(--iflyv-spacing-3);
  margin-top: var(--iflyv-spacing-4);
}
</style>
