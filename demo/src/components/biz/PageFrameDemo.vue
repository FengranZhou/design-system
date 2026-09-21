<template>
  <section id="page-frame" class="demo-section">
    <!-- 标题行按 toolbar-pattern 分支①：标题左、操作右。
         全屏是「看 demo 的辅助手段」，不是 PageFrame 的能力，故只做在本页、不进组件源头。 -->
    <div class="iflyv-toolbar page-frame-demo__toolbar">
      <div class="iflyv-toolbar__left">
        <h2 class="demo-section__title">PageFrame 页面框架</h2>
      </div>
      <div class="iflyv-toolbar__right">
        <CopyToCC anchor="page-frame" :values="{ grouped, showMore, courseMenuEnabled, courseInfoCustom }" />
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
        avatar-role="teacher-male"
        user-name="王老师"
        :avatar-menus="avatarMenus"
        :show-more="showMore"
        v-model:more-keys="moreKeys"
        @avatar-menu-click="onAvatarMenuClick"
        @course-menu-click="onCourseMenuClick"
      >
        <!-- #course-info：只替换卡内信息区，封面图 / 右上「更多」入口 / 压暗蒙层与
             定位仍由源头给。作用域参数 course 可直接取已传入的数据，不必再传一份。
             这里不写任何颜色——浅色文字由源头 .page-frame__course-info 容器给，
             自定义内容默认即可读（要整块换掉含封面的卡片才用 #course-card）。 -->
        <template v-if="courseInfoCustom" #course-info="{ course: c }">
          <p class="page-frame__course-name">{{ c.name }}</p>
          <p class="course-info-demo__progress">高二(3)班 · 已上 12 / 32 课时</p>
        </template>

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
          <div class="iflyv-toolbar nav-config__toolbar">
            <div class="iflyv-toolbar__left">
              <h3 class="iflyv-toolbar__title">配置项</h3>
            </div>
            <div class="iflyv-toolbar__right">
              <!-- 开关文字默认 active-text（右侧），字重/间距/取色全在源头 switch.scss。
                   两个开关并排：间距由 .iflyv-toolbar__right 的 flex gap 给（源头 toolbar.scss） -->
              <el-switch v-model="grouped" active-text="分组" />
              <el-switch v-model="showMore" active-text="更多" />
              <el-switch v-model="courseMenuEnabled" active-text="课程卡更多" />
              <el-switch v-model="courseInfoCustom" active-text="课程卡信息区自定义" />
            </div>
          </div>

          <div class="nav-config__groups">
            <!-- 不分组时 sections 已把各组合并成单个区块 → 只渲染一张卡、一个「添加一级导航」，
                 序号也跨原组连续（见 sections 计算属性） -->
            <section v-for="(group, gi) in sections" :key="group.id" class="nav-group">
              <!-- 组标题行：模块级工具栏（标题加 --module 降字阶）。
                   不分组时整行不渲染 —— 导航已平铺成一条列表，「第 N 组」与
                   「删除该组」都失去了指代对象。 -->
              <div v-if="grouped" class="iflyv-toolbar nav-group__toolbar">
                <div class="iflyv-toolbar__left">
                  <h4 class="iflyv-toolbar__title iflyv-toolbar__title--module">第 {{ gi + 1 }} 组</h4>
                </div>
                <div class="iflyv-toolbar__right">
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
                      <!-- 就地重命名：点名字进入编辑，回车/失焦提交，Esc 取消。
                           用 el-input 而非自写 contenteditable —— 输入框是标准控件，
                           尺寸/描边/聚焦态全在源头。 -->
                      <el-input
                        v-if="editingKey === `l1-${item.id}`"
                        ref="renameInputRef"
                        v-model="editingName"
                        class="nav-row__rename"
                        @keyup.enter="commitRename(item)"
                        @keyup.esc="cancelRename"
                        @blur="commitRename(item)"
                      />
                      <span v-else class="nav-row__name-cell">
                        <span
                          class="nav-row__name nav-row__name--editable"
                          @click="startRename(`l1-${item.id}`, item.name)"
                        >{{ item.name }}</span>
                        <!-- 铅笔入口：纯图标按规范配 tooltip 给全称。
                             hover 整行才显现——常显会让列表被一排铅笔占满、喧宾夺主。 -->
                        <el-tooltip content="重命名" :show-after="300">
                          <el-button
                            text
                            class="nav-row__rename-btn"
                            @click="startRename(`l1-${item.id}`, item.name)"
                          >
                            <template #icon><Pencil :size="16" :stroke-width="2" /></template>
                          </el-button>
                        </el-tooltip>
                      </span>
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
                        <el-input
                          v-if="editingKey === `l2-${child.id}`"
                          ref="renameInputRef"
                          v-model="editingName"
                          class="nav-row__rename"
                          @keyup.enter="commitRename(child)"
                          @keyup.esc="cancelRename"
                          @blur="commitRename(child)"
                        />
                        <span v-else class="nav-row__name-cell">
                          <span
                            class="nav-row__name nav-row__name--editable"
                            @click="startRename(`l2-${child.id}`, child.name)"
                          >{{ child.name }}</span>
                          <el-tooltip content="重命名" :show-after="300">
                            <el-button
                              text
                              class="nav-row__rename-btn"
                              @click="startRename(`l2-${child.id}`, child.name)"
                            >
                              <template #icon><Pencil :size="16" :stroke-width="2" /></template>
                            </el-button>
                          </el-tooltip>
                        </span>
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
                <p v-else class="nav-row nav-row--empty">{{ grouped ? '该组暂无一级导航' : '暂无一级导航' }}</p>

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
              v-if="grouped"
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
import CopyToCC from '../CopyToCC.vue'
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, h } from 'vue'
import { ElMessage } from 'element-plus'
import { CirclePlus, Trash2, Maximize, Minimize, Pencil } from 'lucide-vue-next'
import { PageFrame, type PageFrameMenuGroup, type PageFrameCourse, type PageFrameAvatarMenuItem } from '../../../../design-spec/components'
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

// 课程卡右上「更多」下拉是否启用（源头据 course.menus 有没有内容决定渲不渲染，
// 无需额外 prop）。开关关掉时不传 menus —— 与业务方「本系统没有这些功能」的情形一致。
// 默认关闭：菜单项各系统有无不一，框架一项不写死，开了才看得到形态。
const courseMenuEnabled = ref(false)

// 是否自定义课程卡信息区（源头 #course-info 插槽）。打开后卡内那行文字换成业务
// 自有字段（此处示意「班级 + 课时进度」），封面图 / 右上「更多」入口 / 压暗蒙层
// 与定位仍由源头给——业务方只换文字内容，不碰卡片结构。
const courseInfoCustom = ref(false)

const course = computed<PageFrameCourse>(() => ({
  name: '《智能启思从零懂智能》',
  meta: ['2023年春', '全网公开', '教务开课'],
  // 卡片右上「更多」下拉：框架一项都不写死，由业务方按自身功能传入
  ...(courseMenuEnabled.value
    ? {
        menus: [
          { key: 'detail', label: '查看课程首页' },
          { key: 'setting', label: '课程设置' },
          { key: 'qrcode', label: '打开二维码' },
        ],
      }
    : {}),
}))

// demo 导航只演示「组标题 / 一级导航 / 二级导航」三层标准结构，
// 不铺具体业务菜单（业务菜单由各接入方按自身信息架构传入 menus）。
//
// 配置模型 = 一棵可任意增删的树，与 menus 的三层结构一一对应：
//   区块（组标题） → 一级导航（可独立开关是否可展开） → 二级导航（仅可展开时存在）
// 每个节点带自增 id 而非用数组下标做 key —— 删中间项时下标会整体前移，
// 用下标派生的 menu key 会让选中态 / 展开态错位跟到别的项上。
// name 存在数据里而非由下标推导（原先是渲染时拼 `一级导航 {{ ii+1 }}`）：
// 改名后要能跟着这条记录走，删掉中间项时其余项的名字也不该跟着重排。
interface ConfigChild { id: number; name: string }
interface ConfigItem {
  id: number
  name: string
  /** 是否可展开（带二级导航）；关闭时保留 children 数据，重新开启可复原 */
  expandable: boolean
  children: ConfigChild[]
}
interface ConfigGroup { id: number; items: ConfigItem[] }

let uid = 0
const nextId = () => ++uid
/** 新建时给个默认名（序号只用于取默认名，之后与下标无关） */
let l1Seq = 0
let l2Seq = 0
const createChild = (name?: string): ConfigChild => ({
  id: nextId(),
  name: name ?? `二级导航 ${++l2Seq}`,
})
const createItem = (expandable = false, childCount = 0): ConfigItem => ({
  id: nextId(),
  name: `一级导航 ${++l1Seq}`,
  expandable,
  children: Array.from({ length: childCount }, () => createChild()),
})
/** 按真实业务名建项（用于 demo 初始数据；children 传名字数组，非空即自动可展开） */
const namedItem = (name: string, children: string[] = []): ConfigItem => ({
  id: nextId(),
  name,
  expandable: children.length > 0,
  children: children.map((c) => createChild(c)),
})
const createGroup = (itemCount = 1): ConfigGroup => ({
  id: nextId(),
  items: Array.from({ length: itemCount }, () => createItem()),
})

// 初始结构：取自真实课程空间的导航配置，比「一级导航 1/2/3」更能看出实际观感。
// 仍分两块 —— 分组开关打开时能看到组标题形态；关掉则合并成一条连续列表。
// 其中 3 项带二级导航（分组管理 / 直播课堂 / 课程管理），同屏对照两种形态。
const groups = ref<ConfigGroup[]>([
  {
    id: nextId(),
    items: [
      namedItem('备授课'),
      namedItem('作业任务'),
      namedItem('课程图谱'),
      namedItem('AI 工作台'),
      namedItem('课程题库'),
      namedItem('分组管理', ['分组方案一']),
      namedItem('直播课堂', ['腾讯会议']),
    ],
  },
  {
    id: nextId(),
    items: [
      namedItem('学生学情'),
      namedItem('课程画像'),
      namedItem('成员管理'),
      namedItem('课程管理', ['课程设置', '课程工具', '学生学习设置', '优质课程评审', '督导反馈', '学生评教']),
      namedItem('课程公告'),
    ],
  },
])

// 配置区渲染用的区块列表：分组时 = 真实的组；不分组时 = 合并成单个区块。
// 合并只在**渲染层**做，底层 groups 数据结构不动 —— 开关切回来时原分组原样恢复。
// 用第一组的 id 作 key，避免切换时整块重建（丢失开关的过渡动画）。
const sections = computed<ConfigGroup[]>(() =>
  grouped.value
    ? groups.value
    : [{ id: groups.value[0]?.id ?? 0, items: groups.value.flatMap((g) => g.items) }],
)

/* ==================== 就地重命名 ====================
   点名字 → 换成输入框；回车或失焦提交、Esc 取消。
   editingKey 用 `l1-${id}` / `l2-${id}` 区分层级，保证同一时刻只有一处在编辑。 */
const editingKey = ref('')
const editingName = ref('')
const renameInputRef = ref()

const startRename = async (key: string, current: string) => {
  editingKey.value = key
  editingName.value = current
  await nextTick()
  // ref 在 v-for 里是数组，取当前渲染出的那一个
  const input = Array.isArray(renameInputRef.value) ? renameInputRef.value[0] : renameInputRef.value
  input?.focus?.()
  input?.select?.()
}

const cancelRename = () => {
  editingKey.value = ''
  editingName.value = ''
}

/** 提交改名；空名视为取消（不允许改成空白，否则侧栏会出现无名项） */
const commitRename = (target: { name: string }) => {
  if (!editingKey.value) return          // Esc 已清空时 blur 还会再触发一次
  const next = editingName.value.trim()
  if (next) target.name = next
  cancelRename()
}

/** 单个区块内一级导航数上限：超出后侧边栏需滚动，仍可继续加，仅作提示 */
const addGroup = () => groups.value.push(createGroup())
const removeGroup = (gi: number) => groups.value.splice(gi, 1)
// 不分组时 section 是合并出来的临时对象，增删要落回真实的组：
//   新增 → 追加到最后一组；删除 → 按扁平序号定位到「哪一组的第几项」
const addItem = (group: ConfigGroup) => {
  if (grouped.value) return group.items.push(createItem())
  const last = groups.value[groups.value.length - 1]
  last.items.push(createItem())
}
const removeItem = (group: ConfigGroup, ii: number) => {
  if (grouped.value) return group.items.splice(ii, 1)
  let i = ii
  for (const g of groups.value) {
    if (i < g.items.length) return g.items.splice(i, 1)
    i -= g.items.length
  }
}
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

// 是否分组：关掉后导航不再渲染组标题（menus 不传 title），其余结构不变。
// 默认关闭 —— 真实课程空间的导航就是一条连续列表，打开开关可看分组形态。
const grouped = ref(false)

// 是否启用「更多」入口（源头 show-more，默认关闭）。关掉时已收纳的项会回到主导航，
// moreKeys 数据仍保留，开关拨回来即原样恢复。
const showMore = ref(false)

// 默认没收纳任何项 —— 由用户开启「更多」后在浮层里点⚙自行配置
const moreKeys = ref<string[]>([])

// 头像下拉菜单：**这里只是示例数据**。个数 / 文案 / 从哪分段 / 哪项是危险项
// 全部由业务方按自己系统的功能传入，框架一项都不写死
// （「我的好友」「模型备案信息」这类各系统有无不一，固化进框架会多出无效项）。
const avatarMenus: PageFrameAvatarMenuItem[] = [
  { key: 'profile', label: '个人中心' },
  { key: 'friends', label: '我的好友' },
  { key: 'feedback', label: '反馈建议', divided: true },
  { key: 'record', label: '模型备案信息' },
  { key: 'report', label: '投诉举报' },
  { key: 'logout', label: '退出登录', divided: true, danger: true },
]
const onAvatarMenuClick = (_key: string, item: PageFrameAvatarMenuItem) => {
  ElMessage({ message: `点击了「${item.label}」`, showClose: true })
}

const onCourseMenuClick = (_key: string, item: { label: string }) => {
  ElMessage({ message: `点击了「${item.label}」`, showClose: true })
}

const menus = computed<PageFrameMenuGroup[]>(() => {
  // 图标序号跨组连续：若用组内索引，每组都从 0 开始，第 4 个图标永远轮不到
  let iconSeq = 0
  return groups.value.map((group) => ({
    // 不分组：不传 title —— 源头 `v-if="group.title"` 据此不渲染组标题行，
    // 导航项照常按组顺序依次排下来（分组间距仍在，只是没有抬头文案）
    ...(grouped.value ? { title: '组标题' } : {}),
    items: group.items.map((item) => ({
      key: `l1-${item.id}`,
      label: item.name,
      icon: ICONS[iconSeq++ % ICONS.length],
      // 关掉「可展开」或子项被删空时不传 children —— 组件据此判定是否为可折叠父项
      ...(item.expandable && item.children.length
        ? { children: item.children.map((child) => ({ key: `l2-${child.id}`, label: child.name })) }
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

/* 名字 + 铅笔成一组：名字按内容宽（不再撑满整列），铅笔紧跟其后 */
.nav-row__name-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--iflyv-spacing-1);
  min-width: 0;
}

/* 可点改名：hover 时给底色提示「这里能点」，不改字色/字重（避免与选中态混淆） */
.nav-row__name--editable {
  padding: 0 var(--iflyv-spacing-1);
  margin-inline-start: calc(var(--iflyv-spacing-1) * -1);  /* 抵消内边距，文字仍与其它行左缘对齐 */
  border-radius: var(--iflyv-radius-xs);
  cursor: pointer;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}
.nav-row__name--editable:hover {
  background-color: var(--iflyv-bg-inset);
}

/* 铅笔：平时隐身、hover 该行才显现——常显会让列表被一排铅笔占满、喧宾夺主。
   用 opacity 而非 v-if/display:none：不占位变化，行宽不会随 hover 跳动。 */
.nav-row__rename-btn {
  opacity: 0;
  transition: opacity var(--iflyv-duration-fast) var(--iflyv-ease-default);
}
.nav-row:hover .nav-row__rename-btn,
.nav-row__rename-btn:focus-visible {
  opacity: 1;
}

/* 重命名输入框：占住名字列的宽度，避免进出编辑态时整行宽度跳变 */
.nav-row__rename {
  width: 200px;
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

/* #course-info 插槽演示里那行业务自有文案。
   课程名沿用源头的 .page-frame__course-name（不在此重定义外观）；
   这一行是源头没有的**新增内容**，故只在本页给它字阶——
   属"业务方自带内容的样式"，不是覆盖组件既有外观。
   文字颜色不写：由源头 .page-frame__course-info 容器统一给浅色。 */
.course-info-demo__progress {
  margin: 0;
  font: var(--iflyv-font-body-min);
  white-space: nowrap;
}
</style>
