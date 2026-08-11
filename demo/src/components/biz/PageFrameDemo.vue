<template>
  <section id="page-frame" class="demo-section">
    <!-- 标题行按 toolbar-pattern 分支①：标题左、操作右。
         全屏是「看 demo 的辅助手段」，不是 PageFrame 的能力，故只做在本页、不进组件源头。 -->
    <div class="toolbar page-frame-demo__toolbar">
      <div class="toolbar__left">
        <h2 class="demo-section__title">PageFrame 页面框架</h2>
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

    <!-- 框架承载舞台：固定高度模拟视口，框架内部自适应铺满（纯本页排版）。
         框架自带 bg-page 灰底，不再套 bg-card 灰卡片，直接描边收边。
         全屏态 = fixed 铺满视口（浏览器界面维持原状），Esc 可退出。 -->
    <div class="page-frame-stage" :class="{ 'page-frame-stage--fullscreen': isFullscreen }">
      <PageFrame
        v-model:active="activeKey"
        :menus="menus"
        :course="course"
        :breadcrumbs="breadcrumbs"
        :back-disabled="backDisabled"
        :notice-count="13"
        avatar-role="teacher-male"
      >
        <!-- 配置项放进内容区（默认插槽）：逐层独立编辑导航结构，
             每层可任意增删，改动实时反映在左侧导航上。
             整体按「列表条目模式」组织：一行 = 一条记录 = 四区拼装
             （01 层级缩进 / 02 名称 / 03 可展开开关 / 04 删除操作）。
             层级为两层嵌套树且需增删，DataTable（配置式扁平表）不适用，
             故按模式手拼行结构，元素仍全部用标准组件与源头约定类。 -->
        <div class="nav-config">
          <!-- 页面级工具栏（toolbar-pattern：仅标题，无操作按钮 ——
               「添加组」与「添加一级/二级导航」同为"在本层末尾追加一条"，
               统一放各层内容末尾，不占工具栏） -->
          <div class="toolbar nav-config__toolbar">
            <div class="toolbar__left">
              <h3 class="toolbar__title">配置项</h3>
            </div>
          </div>

          <div class="nav-config__groups">
            <section v-for="(group, gi) in groups" :key="group.id" class="nav-group">
              <!-- 组标题行：模块级工具栏（标题加 --module 降字阶） -->
              <div class="toolbar nav-group__toolbar">
                <div class="toolbar__left">
                  <h4 class="toolbar__title toolbar__title--module">第 {{ gi + 1 }} 组</h4>
                </div>
                <div class="toolbar__right">
                  <!-- 纯图标入口必须配 tooltip 给全称（否则语义靠猜），统一 show-after 300 -->
                  <el-tooltip content="删除该组" :show-after="300">
                    <el-button
                      text
                      :disabled="groups.length <= 1"
                      @click="removeGroup(gi)"
                    >
                      <template #icon><Trash2 :size="16" :stroke-width="2" /></template>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>

              <!-- 组内容卡片：该组的导航行整体包成一张卡，与组标题工具栏区分开 -->
              <div class="nav-group__body">
                <template v-if="group.items.length">
                  <template v-for="(item, ii) in group.items" :key="item.id">
                    <!-- 一级导航行 -->
                    <div class="nav-row">
                      <span class="nav-row__name">一级导航 {{ ii + 1 }}</span>
                      <div class="nav-row__info">
                        <!-- 文字置左（inactive-text）：本行开关右侧还有删除按钮，
                             文字若落右侧会夹在开关与按钮之间、看不出归属。 -->
                        <el-switch
                          v-model="item.expandable"
                          inactive-text="可展开"
                          @change="(val: boolean) => onExpandableChange(item, val)"
                        />
                      </div>
                      <div class="nav-row__actions">
                        <el-tooltip content="删除该一级导航" :show-after="300">
                          <el-button text @click="removeItem(group, ii)">
                            <template #icon><Trash2 :size="16" :stroke-width="2" /></template>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>

                    <!-- 二级导航行：缩进一档体现从属，仅该项可展开时出现 -->
                    <template v-if="item.expandable">
                      <div
                        v-for="(child, ci) in item.children"
                        :key="child.id"
                        class="nav-row nav-row--child"
                      >
                        <span class="nav-row__name">二级导航 {{ ci + 1 }}</span>
                        <div class="nav-row__info" />
                        <div class="nav-row__actions">
                          <!-- 每条都可删；删空后由 removeChild 自动关掉「可展开」，
                               不留「开着开关却没有子项」的矛盾态 -->
                          <el-tooltip content="删除该二级导航" :show-after="300">
                            <el-button text @click="removeChild(item, ci)">
                              <template #icon><Trash2 :size="16" :stroke-width="2" /></template>
                            </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                      <div class="nav-row nav-row--child nav-row--add">
                        <el-button text type="primary" @click="addChild(item)">
                          <template #icon><CirclePlus :size="16" :stroke-width="2" /></template>
                          添加二级导航
                        </el-button>
                      </div>
                    </template>
                  </template>
                </template>
                <p v-else class="nav-row nav-row--empty">该组暂无一级导航</p>

                <div class="nav-row nav-row--add">
                  <el-button text type="primary" @click="addItem(group)">
                    <template #icon><CirclePlus :size="16" :stroke-width="2" /></template>
                    添加一级导航
                  </el-button>
                </div>
              </div>
            </section>

            <!-- 添加组：实心主按钮，落在组列表末尾。
                 与组内「添加一级/二级导航」的文字按钮拉开层级 —— 组是最外层结构，
                 新增它是本页最主要的操作。 -->
            <el-button
              type="primary"
              class="nav-config__add-group"
              @click="addGroup"
            >
              <template #icon><CirclePlus :size="16" :stroke-width="2" /></template>
              添加组
            </el-button>
          </div>
        </div>
      </PageFrame>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, h } from 'vue'
import { ElMessage } from 'element-plus'
import { CirclePlus, Trash2, Maximize, Minimize } from 'lucide-vue-next'
import { PageFrame, type PageFrameMenuGroup, type PageFrameCourse } from '../../../../design-spec/components'
import NavIcon from './NavIcon.vue'
// 导航图标双态切图（?raw 内联，currentColor 才能生效——<img> 拿不到父级色）
import establishSvg from '../../assets/nav-icons/establish.svg?raw'
import establishActiveSvg from '../../assets/nav-icons/establish-active.svg?raw'
import progressSvg from '../../assets/nav-icons/progress.svg?raw'
import progressActiveSvg from '../../assets/nav-icons/progress-active.svg?raw'
import aiSettingSvg from '../../assets/nav-icons/ai-setting.svg?raw'
import aiSettingActiveSvg from '../../assets/nav-icons/ai-setting-active.svg?raw'
import releaseProcessSvg from '../../assets/nav-icons/release-process.svg?raw'
import releaseProcessActiveSvg from '../../assets/nav-icons/release-process-active.svg?raw'

const course: PageFrameCourse = {
  name: '《智能启思从零懂智能》',
  meta: ['2023年春', '全网公开', '教务开课'],
}

// demo 导航只演示「组标题 / 一级导航 / 二级导航」三层标准结构，
// 不铺具体业务菜单（业务菜单由各接入方按自身信息架构传入 menus）。
//
// 配置模型 = 一棵可任意增删的树，与 menus 的三层结构一一对应：
//   区块（组标题） → 一级导航（可独立开关是否可展开） → 二级导航（仅可展开时存在）
// 每个节点带自增 id 而非用数组下标做 key —— 删中间项时下标会整体前移，
// 用下标派生的 menu key 会让选中态 / 展开态错位跟到别的项上。
interface ConfigChild { id: number }
interface ConfigItem {
  id: number
  /** 是否可展开（带二级导航）；关闭时保留 children 数据，重新开启可复原 */
  expandable: boolean
  children: ConfigChild[]
}
interface ConfigGroup { id: number; items: ConfigItem[] }

let uid = 0
const nextId = () => ++uid
const createChild = (): ConfigChild => ({ id: nextId() })
const createItem = (expandable = false, childCount = 0): ConfigItem => ({
  id: nextId(),
  expandable,
  children: Array.from({ length: childCount }, createChild),
})
const createGroup = (itemCount = 1): ConfigGroup => ({
  id: nextId(),
  items: Array.from({ length: itemCount }, () => createItem()),
})

// 初始结构：一块纯一级项 + 一块含可展开项，同屏对照两种形态
const groups = ref<ConfigGroup[]>([
  { id: nextId(), items: [createItem(), createItem(), createItem()] },
  { id: nextId(), items: [createItem(true, 2), createItem()] },
])

/** 单个区块内一级导航数上限：超出后侧边栏需滚动，仍可继续加，仅作提示 */
const addGroup = () => groups.value.push(createGroup())
const removeGroup = (gi: number) => groups.value.splice(gi, 1)
const addItem = (group: ConfigGroup) => group.items.push(createItem())
const removeItem = (group: ConfigGroup, ii: number) => group.items.splice(ii, 1)
const addChild = (item: ConfigItem) => item.children.push(createChild())
// 删空二级导航后自动关掉「可展开」——开着开关却没有子项是自相矛盾的状态。
// 不用禁用最后一条的删除按钮来拦：那要求用户先自己想到「去关开关」，
// 这里直接让状态跟着数据走，用户少一步。
const removeChild = (item: ConfigItem, ci: number) => {
  item.children.splice(ci, 1)
  if (!item.children.length) item.expandable = false
}

// 开「可展开」时若尚无二级导航，自动补一条（否则开了开关侧边栏却毫无变化）
const onExpandableChange = (item: ConfigItem, val: boolean) => {
  if (val && !item.children.length) item.children.push(createChild())
}

// —— 全屏预览（仅 demo 的看图辅助，不属于 PageFrame 的能力）——
// 不用原生 Fullscreen API：那会连浏览器地址栏/书签栏一起隐藏，而这里只要框架
// 铺满视口、浏览器界面维持原状。故改为 fixed 铺满视口的「页内全屏」。
const isFullscreen = ref(false)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // 全屏后按钮被盖住，Esc 是唯一出口，进入时必须告知——否则用户会被困住。
  // showClose 必传：源头定制了关闭按钮并强制常显，不传就看不到。
  if (isFullscreen.value) {
    ElMessage({ message: '已进入全屏预览，按 Esc 退出', showClose: true })
  }
}

// Esc 退出（页内全屏没有原生全屏的 Esc，须自己补，否则用户无路可退）
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !isFullscreen.value) return
  isFullscreen.value = false
  // 主动失焦：进全屏是鼠标点的，按钮一直保留着 focus；用 Esc 退出会把浏览器
  // 切到「键盘操作」模态，于是那个仍聚焦的按钮开始命中 :focus-visible，
  // 退出后凭空多出一圈绿描边。源头的「鼠标点击不显框」本身是对的，
  // 这里只需断掉焦点——退出全屏并非要把焦点交还给这个按钮。
  ;(document.activeElement as HTMLElement | null)?.blur()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

// 一级导航图标池：按 id 循环取用，仅作视觉示意（真实项目按业务语义选图标）。
// 每个图标一对双态切图（默认描边 / 选中实心），已洗成单色 currentColor、由令牌赋色；
// icon 只接一个组件，故用 h() 把双态预置成组件再传入
const ICONS = [
  { normal: establishSvg, activeSvg: establishActiveSvg },
  { normal: progressSvg, activeSvg: progressActiveSvg },
  { normal: aiSettingSvg, activeSvg: aiSettingActiveSvg },
  { normal: releaseProcessSvg, activeSvg: releaseProcessActiveSvg },
  // 预置双态后包成组件；选中态由 PageFrame 透传 active，与这里的 attrs 合并
].map((pair) => (props: Record<string, unknown>) => h(NavIcon, { ...pair, ...props }))

const menus = computed<PageFrameMenuGroup[]>(() => {
  // 图标序号跨组连续：若用组内索引，每组都从 0 开始，第 4 个图标永远轮不到
  let iconSeq = 0
  return groups.value.map((group) => ({
    title: '组标题',
    items: group.items.map((item) => ({
      key: `l1-${item.id}`,
      label: '一级导航',
      icon: ICONS[iconSeq++ % ICONS.length],
      // 关掉「可展开」或子项被删空时不传 children —— 组件据此判定是否为可折叠父项
      ...(item.expandable && item.children.length
        ? { children: item.children.map((child) => ({ key: `l2-${child.id}`, label: '二级导航' })) }
        : {}),
    })),
  }))
})

const activeKey = ref('')

// 配置变更后选中项可能已失效 → 始终回落到「首个可选中项」。
// 可选中 ≠ 全部项：带 children 的一级项点击只负责展开/收起、自身不可选中
// （见 PageFrame 源头 `!item.children?.length && active === item.key`），
// 故它的 key 不能进候选集——否则 activeKey 停在这类 key 上会通过校验，
// 但侧边栏里没有任何一项高亮，看起来就是"默认没选中"。
// 候选集按视觉顺序摊平（一级项 → 紧随其后的二级项），取第一个即首个可选中项。
// immediate 让初始选中态也走这套逻辑，不必手写死初值。
const selectableKeys = computed(() =>
  menus.value.flatMap((g) =>
    g.items.flatMap((i) => (i.children?.length ? i.children.map((c) => c.key) : [i.key])),
  ),
)

watch(
  selectableKeys,
  (keys) => {
    if (keys.includes(activeKey.value)) return
    activeKey.value = keys[0] ?? ''
  },
  { immediate: true },
)

// 面包屑随选中项联动：所在分组名 →（父项名 →）当前项名
const breadcrumbs = computed(() => {
  for (const group of menus.value) {
    for (const item of group.items) {
      if (item.key === activeKey.value)
        return [{ label: group.title ?? '' }, { label: item.label }]
      const child = item.children?.find((c) => c.key === activeKey.value)
      if (child)
        return [{ label: group.title ?? '' }, { label: item.label }, { label: child.label }]
    }
  }
  return [{ label: '组标题' }]
})

// 返回箭头可用性：看「上一级是不是可跳转的实体页面」——
// 组标题只是分组文案、可折叠的一级导航点击只展开子菜单，两者都不是实体页面，
// 所以本 demo 的导航结构里始终没有可返回的上一级 → 箭头恒禁用。
// 真实项目里若某层确实是实体页（有自己的路由），则该层为当前页时传 false 即可。
const backDisabled = computed(() => true)
</script>

<style scoped>
/* 承载舞台：固定高度模拟真实视口（纯本页排版，不碰组件外观）。
   圆角 + overflow 只为裁掉框架溢出的直角，不加描边——框架自带 bg-page 灰底，
   与页面白底已有明度差，边界自明。 */
/* 标题行：页面级标题与下方内容间距 16（spacing-4）。
   标题本身的字阶由 .demo-section__title 给（全局），此处只负责左右分配与留白。 */
.page-frame-demo__toolbar {
  margin-bottom: var(--iflyv-spacing-4);
}

/* 标题在 toolbar 内不再自带下边距（改由 toolbar 统一给），避免双份留白 */
.page-frame-demo__toolbar .demo-section__title {
  margin-bottom: 0;
}

.page-frame-stage {
  position: relative;   /* 全屏退出按钮的定位锚点 */
  height: 640px;
  border-radius: var(--iflyv-radius-lg);
  overflow: hidden;
}

/* 全屏态：fixed 铺满视口（浏览器界面维持原状，不用原生 Fullscreen API）。
   圆角去掉——四角即视口角。
   层级取 sticky+1：本质是「页面级固定框架」而非弹窗，只需压过 demo 外壳的吸顶导航
   （global.scss 用的就是 sticky 档）。
   ⚠️ 不能取 dialog(4000)：EP 的 Message 由 JS 逐个派发 z-index（自 2000 起递增，
   写成行内样式），行内值压过源头 scss 里的 var(--iflyv-z-message)——
   遮罩若坐到 4000 就会把 Message 盖住（曾因此完全看不到提示）。 */
.page-frame-stage--fullscreen {
  position: fixed;
  inset: 0;
  height: auto;
  z-index: calc(var(--iflyv-z-sticky) + 1);
  border-radius: 0;
}


/* ===== 导航结构配置区（纯本页排版：只排自己的骨架，不碰组件外观） =====
   工具栏的布局 / 元素间距 / 标题字阶、按钮与开关的外观均在全局源头，
   本页只写留白与行的列轨道。留白按 foundations 间距速查取档。 */

/* 页面内容区容器：左右内边距一次给全（spacing-6 = 页面内容距页面左右内间距），
   工具栏 / 导航行 / 空态等所有内容共用这一次，自然左右齐平，各自不再写 */
.nav-config {
  padding-inline: var(--iflyv-spacing-6);
  padding-bottom: var(--iflyv-spacing-6);
}

/* 页面级标题：距页面顶部 16、距下方内容 16（spacing-4） */
.nav-config__toolbar {
  padding-block: var(--iflyv-spacing-4);
}

/* 模块级标题：距下方内容 12（spacing-3，比页面级收一档）；
   上方留白由组间距提供，故不重复给 */
.nav-group__toolbar {
  padding-block-end: var(--iflyv-spacing-3);
}

/* 模块垂直间距 spacing-8（32）——组与组是模块关系，靠留白划分模块边界 */
.nav-group + .nav-group {
  margin-top: var(--iflyv-spacing-8);
}

/* 组内容卡片：包裹该组全部导航行，靠底色成形、不描边
   （底色已与页面白底拉开层次，再加描边就重了） */
.nav-group__body {
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-md);
  overflow: hidden;
}

/* 行：四区列轨道 —— 名称(弹性) / 关键信息(定宽) / 操作(定宽)。
   各层级共用同一套轨道 → 开关与删除按钮天然纵向对齐成列。
   左右内边距为卡片内边距（卡片外缘的内边距由页面内容区容器提供）。 */
.nav-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--iflyv-spacing-3);
  min-height: 48px;
  padding-inline: var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-body-primary);
}

/* 行间细分割线（列表条目的常规分隔，靠极细线不靠卡片）。
   二级行不画横线（见下方 --child），否则一级项与它自己的子项被切断，
   看起来像三条平级记录。
   左右各缩进 spacing-4（16px），与行内内容左右缘对齐，不贴到卡片边缘。
   用伪元素而非 border-top —— border 只能通栏，做不出左右缩进。
   二级组之后的一级行同样要画：留白负责「这组结束了」，线负责「下面是另一条一级记录」，
   两者职责不同，都要有。 */
.nav-row + .nav-row:not(.nav-row--child) {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    /* 贴本行上边缘（外边距之下）——紧跟二级组时，即「距上方小卡 16px、距本行 0」，
       线归属于它下面这条记录，而非浮在两者中间 */
    top: 0;
    inset-inline: var(--iflyv-spacing-4);
    height: 1px;
    background: var(--iflyv-border-subtle);
  }
}

.nav-row__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 关键信息区：宽度由内容（开关 + 文字）决定。
   各行内容同构，auto 列自然等宽 → 开关左缘天然对齐，无需定宽。
   二级行此格为空 div，仍占位保持列结构一致。 */

/* 操作区固定行尾（列表条目模式：操作区固定右侧） */
.nav-row__actions {
  justify-self: end;
}

/* 二级行：在卡片内边距基础上再缩进一档体现从属，色阶降一级。
   从属关系靠「底色块」表达而非分隔线 —— 二级行铺 bg-card 浅底，
   在一级行的白底上自成一块，一眼看出是归在上一级名下的一段内容。
   行间留 spacing-2（8px）垂直间距，让每条二级项各自成块、不糊成一片。 */
.nav-row--child {
  /* 左右各留 spacing-4（16px）外边距：底色块从卡片两侧缩进，
     不贴到卡片边缘上，与一级行的内容左右缘对齐。 */
  margin-inline: var(--iflyv-spacing-4);
  /* 纯白：与外层 bg-card 卡片底色拉开层次（外层灰、内层白） */
  background: var(--iflyv-bg-panel);
  border-radius: var(--iflyv-radius-sm);
  color: var(--iflyv-text-2);

  & + .nav-row--child {
    margin-top: var(--iflyv-spacing-2);
  }
}

/* 二级组结束后与下一条一级行的间距：比二级行彼此之间（spacing-2）大一档，
   让「这组二级导航结束了」有明确的收尾留白。8 + 8 = 16，正好落在 spacing-4 档。 */
.nav-row--child + .nav-row:not(.nav-row--child) {
  margin-top: var(--iflyv-spacing-4);
}

/* 添加行 / 空态行：无关键信息与操作，单列铺满，内容靠左与各行名称左缘齐 */
.nav-row--add,
.nav-row--empty {
  grid-template-columns: 1fr;
  justify-items: start;
}

.nav-row--empty {
  margin: 0;
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}

/* 添加组按钮：与组是同级（不在任何组卡片内），上方留白取模块间距 spacing-8、与组间一致。
   纯本页排版留白，按钮自身外观全部来自 button.scss 源头。 */
.nav-config__add-group {
  margin-top: var(--iflyv-spacing-8);
}
</style>
