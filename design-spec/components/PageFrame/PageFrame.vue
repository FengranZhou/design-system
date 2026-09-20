<!-- ============================================================================
  PageFrame 页面框架（业务组件）——接入方速查
  ----------------------------------------------------------------------------
  何时用：整页级后台框架（左侧边导航 + 底部用户区 + 白色内容区），
         如课程空间、管理后台等「进入某对象后的工作区」页面骨架。
  ⛔ 无顶栏：本框架**不提供**顶栏，也没有面包屑相关的 prop / 插槽 / 事件。
         层级返回归业务在内容区自行处理——需要时在 #page-header 或内容里
         用业务组件 Breadcrumb（见 component-interaction.md Breadcrumb 段）。
  引用：  import { PageFrame } from '<path>/design-spec/components'
  用法：
    <PageFrame
      v-model:active="activeKey"
      :menus="menus"
      :course="{ name: '《智能启思从零懂智能》', meta: ['2023年春', '全网公开'] }"
      :notice-count="13"
      avatar-role="teacher-female"
      user-name="王老师"
      @back-platform="router.push('/')"
    >
      <template #page-header>                ← 不滚的页头（**仅**放含页面级 tab 的工具栏）
        <div class="toolbar"><el-tabs class="tabs-page">…</el-tabs></div>
      </template>
      <div class="my-page">页面内容（滚动区内，留白由本页自己给）</div>
    </PageFrame>
  props：
    menus          PageFrameMenuGroup[]  必填。侧边导航分组：{ title?, items: [{ key, label, icon?, children? }] }。
                                         **要不要分组由 title 决定**：传了才渲染组标题；不传即**平铺成一条
                                         连续列表**（组间距本就由组标题的 margin 提供，没有标题自然也没有组间距）。
                                         导航结构简单、没有可归类的上位词时用不分组形态。
                                         item 带 children 时为可折叠父项（点击只展开/收起，子项才可选中）。
                                         icon 渲染时会收到 :active（该项是否选中）——图标组件若要做
                                         默认/选中双态切图，声明 active prop 接住即可；不需要则忽略
                                         （Lucide 等不认识它的组件会把它落成无害的 DOM 属性）。
    v-model:active string                当前选中菜单 key（含子项 key）。选中态 = 加粗 + text-1。
    course         PageFrameCourse       可选。侧边栏顶部课程卡 { name, meta?, cover?, menus? }；不传则不渲染。
                                         `menus` = 卡片右上「更多」入口的下拉项
                                         [{ key, label, divided?, danger?, disabled? }]，hover 图标展开、
                                         点击接 @course-menu-click。**框架一项都不写死**——「查看课程首页」
                                         「课程设置」「打开二维码」这类各系统有无不一，由业务方传入
                                         （同 avatarMenus 口径）；不传或空数组 → 不渲染该入口。
    back-text      string                可选，默认「我教的课」。侧边栏顶部返回按钮文案；传空串隐藏按钮。
    show-help / show-notice  boolean     可选，默认 true。侧栏底部帮助 / 通知铃铛图标
                                         （均自带 el-tooltip 全称提示，向上展开）。
    help-text / notice-text  string      可选，默认「帮助中心」「消息提醒」。上述两个图标的 tooltip 文案，
                                         改叫法 / 国际化时传入。**不要传空串**——纯图标入口没有全称
                                         就只能靠猜（见 component-interaction.md Tooltip 段）；
                                         不需要该入口请用 show-help / show-notice 关掉整个图标。
    notice-count   number                可选，默认 0。通知未读数（el-badge，0 时隐藏红点）。
    avatar-role / avatar-src             可选。**侧栏底部**头像（透传业务组件 UserAvatar）；都不传则不渲染头像。
    user-name      string                可选。头像右侧显示的用户名（如「王老师」）；不传则只显示头像。
                                         收起态（64px 放不下）自动隐藏。名字过长自动省略，不挤走右侧图标。
    avatar-menus   PageFrameAvatarMenuItem[]  可选。头像下拉菜单项 [{ key, label, divided?, danger?, disabled? }]，
                                         hover 头像向右展开。**框架一项都不写死**——个数 / 文案 / 从哪分段 /
                                         哪项是危险项全由业务方按自己系统的功能传入（「我的好友」「模型备案信息」
                                         这类各系统有无不一）。`divided: true` = 与上一项之间加分隔线（用来分段）；
                                         `danger: true` = 破坏性操作转红字（退出登录、注销账号）。
                                         不传或空数组 → 头像只是纯点击入口（仍 emit avatar-click），不出下拉。
    content-only   boolean               可选，默认 false。**只渲染主内容区**（page-frame__content 白卡），
                                         不渲染侧边栏、不套横向滚动壳、不吃 1200 最小宽度，
                                         且白卡四边 margin 全部归零、直接铺满承载容器。
                                         用于「整页框架的内容区被单独嵌进别处」的场景
                                         （外壳导航由宿主页面提供，只想复用本框架的内容卡
                                         ——白底 + 不滚页头 + 滚动区 + 滚动分割线时间线）。
                                         ⚠️ 此模式下侧边栏相关 props / emits / 插槽
                                         （menus·course·avatar·show-more·#course-card…）全部不生效；
                                         留白归承载方（外层容器自己给），本组件一律不给。
    show-more      boolean               可选，**默认 false（不启用）**。是否在导航末尾放「更多」入口——
                                         它是收纳不常用功能的固定位置（与「常用功能」相反：把低频项
                                         从主导航挪走，主导航保持精简）。导航本就精简的系统不必开，
                                         多一个空入口反而是噪音。开启后没收纳任何项时入口也在，
                                         浮层里提示去哪配置。
                                         ⚠️ **关闭时已收进「更多」的项会回到主导航**（moreKeys 数据保留、
                                         重新开启原样恢复）——否则它们既不在主导航也没有浮层入口，会彻底消失。
    more-text      string                可选，默认「更多」。「更多」入口的文案（show-more 开启时才有意义）。
    v-model:more-keys  string[]          已收进「更多」的一级导航 key（**需 show-more 开启才生效**）。
                                         **收进来的项从主导航消失**、
                                         只在 hover 浮层里出现；整组被收空时该组连标题一起不渲染。
                                         浮层只列出已收纳项、点即跳转；**增删配置走抬头 ⚙ 调起的配置弹窗**
                                         （800 档双栏：左「已展示」/ 右「收进更多」，⊖⊕ 互相搬运，
                                         **点「确认」才 emit**、取消或关闭即丢弃草稿，确认后弹「设置成功」轻提示）。
                                         默认为空 → 浮层显示「将不常用的功能收进来」。
                                         ⚠️ **一级项与二级项都可收纳**（moreKeys 混装两层的 key）；
                                         只有带 children 的**可折叠父项自身**不在候选里——它不可跳转、
                                         收进来点了没反应。父项的子项被**全部**收走时，
                                         父项自己也不再渲染（空壳父项点开什么都没有）。
    v-model:collapsed  boolean           可选，默认 false。侧边栏收起态。**不传也能用**——组件内部自管状态，
                                         只有需要外部读取/持久化（如记住用户偏好）时才传。
  收起交互（内置，接入方无需做任何事）：
    hover 侧边栏 → 右缘垂直居中浮出收起把手 → 点击收起为 64px 图标栏
    （返回平台收成图标、课程卡与分组标题隐藏）→ hover 某图标弹出下拉面板补回分组标题与子项。
    ⛔ **收放只由用户决定，系统不自动干预**——不按视口宽度自动折叠（该行为已于 2026-09 移除）。
    侧栏的收放是用户的显式选择，不该因为拖窗口 / 切显示器 / 分屏就自己变形。
    因此组件**不监听 resize**，collapsed 只会被「用户点把手」或「外部 v-model」改变。
    要记住用户偏好：传 v-model:collapsed 自行持久化，组件不会覆盖它。
  emits：
    menu-select(key, item)  选中某菜单项（父项展开/收起不触发）
    collapse-change(collapsed)  侧边栏收起 / 展开切换
    update:more-keys(keys)      「更多」收纳项变更（点保存才触发）
    more-select(key, item)      点击「更多」浮层里的某一项
    avatar-menu-click(key, item)  点击头像下拉里的某一项
    course-menu-click(key, item)  点击课程卡右上「更多」下拉里的某一项
    back-platform / course-click / help-click / notice-click / avatar-click
  slots：
    默认插槽      内容区（白色内容卡内的**滚动区**）。滚动由框架提供，内容超出即在此滚动。
                  ⚠️ **留白仍归业务层**：内容根自己给 padding（与左右边缘 spacing-6），
                  框架不给内边距。
    #page-header  页面级页头（可选），在**滚动区之外**——始终可见、不参与滚动。
                  ⚠️ **只放含页面级 tab（`.tabs-page`）的工具栏**：tab 是「我在哪个分区」的
                  定位信息、且要能就地切换，滚走会失去上下文；放在滚动区里还会让
                  滚动条轨道把这段永远不滚的区域也算进去（观感不对）。
                  ⛔ **纯页面标题工具栏不要放这里**——它没有上述作用，应放默认插槽、
                  跟着内容一起滚走（分割线同理，源头已限定在 tab 档）。
                  内边距由 `.toolbar` 页面级档自带（上下 16 / 左右 24），本插槽不再给。
                  范本见 demo 的 CourseDashboardPageDemo / PublicInfoPageDemo。
    #course-card  整体替换侧边栏课程卡
    #course-info  只替换课程卡内的信息区（课程名 + 元信息），封面图 / 更多入口 / 蒙层
                  与定位仍由源头给。作用域参数 `course` 可直接取用已传入的数据：
                  <template #course-info="{ course }"> … </template>
                  ⚠️ 整块换掉封面在内的卡片才用 #course-card，别拿本插槽重拼整卡。
    #sidebar-bottom     侧栏底部追加自定义入口，插在内置入口【之前】（展开态=头像左侧 / 收起态=最下方）
    #sidebar-bottom-end 侧栏底部追加自定义入口，插在内置入口【之后】（展开态=铃铛右侧 / 收起态=最上方）
                        ⚠ 收起态整排反向竖排（消息→帮助→头像），故"之前/之后"在竖排时上下颠倒
                      ↑ 内置入口顺序为 头像 → 帮助 → 消息；这一排**水平等分**，
                        追加的入口自动多占一个等分列、仍保持均匀，无需写任何样式。
                        两个插槽按需选用、可同时用。自定义入口若是纯图标，
                        套 <el-tooltip :show-after="300"> 补全称、并复用约定 class
                        page-frame__icon-btn 拿到与内置入口一致的 28px 热区与配色。
  最小宽度：整页框架有 1200px 宽度下限（--iflyv-layout-min-width）。承载容器窄于此值时，
           框架自身出横向滚动条、内部布局不再压缩——接入方无需做任何事，也勿在外层
           另加 overflow-x / 自设 min-width 覆盖（会与本机制打架）。
  禁止：手写 aside/header div 拼同款框架、用 el-menu/el-container 复刻这套观感——一律用本组件。
  改外观：回本文件源头改，改一次所有引用方同步（勿在使用方私自覆盖）。
============================================================================ -->
<template>
  <!-- 最外层横向滚动壳：整页框架有 1200px 最小宽度（--iflyv-layout-min-width），
       容器窄于此值时由本壳出横向滚动条，而非把侧边栏 + 内容区继续压到不可用。
       滚动条用 el-scrollbar（同侧边栏 / 内容区），不用原生 overflow-x。 -->
  <!-- content-only：只渲染内容卡本身——不套横向滚动壳（壳只为 1200 下限而存在）、
       不渲染侧边栏、白卡四边 margin 归零直接铺满承载容器。
       宿主页面自带导航时复用本框架内容卡（白底 + 不滚页头 + 滚动区 + 滚动分割线时间线）。 -->
  <main v-if="contentOnly" class="page-frame__content is-content-only">
    <div v-if="$slots['page-header']" class="page-frame__page-header">
      <slot name="page-header" />
    </div>
    <el-scrollbar class="page-frame__scroll-area scroll-fill" view-class="page-frame__scroll-area-view">
      <slot />
    </el-scrollbar>
  </main>

  <el-scrollbar v-else class="page-frame-shell" view-class="page-frame-shell__view">
    <div class="page-frame">
      <!-- ==================== 侧边栏 ==================== -->
      <!-- hover 整条侧栏才浮出收起把手（把手常显会成为持续的视觉噪音） -->
      <aside
        class="page-frame__sidebar"
        :class="{ 'is-collapsed': collapsed }"
        @mouseenter="onSidebarEnter"
        @mouseleave="onSidebarLeave"
      >
        <!-- 收起把手：贴侧栏右缘垂直居中，薄片形状用 CSS 遮罩绘制（见样式段），
             底色随灰底令牌走。收起态图标翻转指向展开方向。 -->
        <!-- 外层 clip 壳固定不动、overflow 裁切：薄片推入/推走时越过壳左缘即被切掉，
             不会跑进侧栏里露脸（壳只做窗口，不接指针事件，点击透传给内部按钮） -->
        <div class="page-frame__handle-clip">
          <Transition name="page-frame-handle">
            <button
              v-show="sidebarHover"
              type="button"
              class="page-frame__handle"
              :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
              @click="toggleCollapse"
            >
              <ChevronLeft :size="16" class="page-frame__handle-icon" />
            </button>
          </Transition>
        </div>

        <button
          v-if="backText"
          type="button"
          class="page-frame__back"
          :title="collapsed ? backText : undefined"
          @click="emit('back-platform')"
        >
          <House :size="16" class="page-frame__back-icon" />
          <!-- 收起态只留图标，文字随宽度一起收掉 -->
          <span v-if="!collapsed">{{ backText }}</span>
        </button>

        <!-- 课程卡 + 导航同处一个滚动区：课程卡随导航一起滚走，不吸顶。
             用 el-scrollbar（基础组件）而非原生滚动条：自绘条浮在内容上不占位、
             无原生 track 白底，且默认 hover 才显形 -->
        <el-scrollbar class="page-frame__scroll" view-class="page-frame__scroll-view">
          <!-- 收起态隐藏课程卡：缩到 64px 宽后封面图与课程名都无法辨识 -->
          <slot v-if="!collapsed" name="course-card">
            <div v-if="course" class="page-frame__course" @click="emit('course-click')">
              <img :src="course.cover || defaultCover" class="page-frame__course-cover" alt="" />
              <!-- 右上「更多」入口：一列可点选项 → 一律 el-dropdown（不手撸浮层）。
                   触发器 = 纯图标（属"紧凑操作位用纯图标触发"档）。
                   @click.stop：入口叠在课程卡上，不 stop 会同时冒泡触发 course-click。
                   常显而非 hover 才出：它替代的是原本常显的文字角标，入口可发现性优先。 -->
              <el-dropdown
                v-if="course.menus?.length"
                class="page-frame__course-more"
                placement="right-start"
                trigger="hover"
                popper-class="page-frame-course-menu"
                :popper-options="COURSE_MENU_POPPER_OPTIONS"
                @command="onCourseCommand"
              >
                <!-- ⚠️ 触发器必须是 el-dropdown 的**直接**子元素：中间夹一层 el-tooltip
                     会被 tooltip 认领成它自己的触发元素，hover 事件到不了 dropdown、
                     面板永远不弹（踩过）。故此处不套 tooltip，全称由 aria-label 承担——
                     菜单项本身已是完整文案，展开即可读，不像纯图标那样语义靠猜。 -->
                <button
                  type="button"
                  class="page-frame__course-more-btn"
                  aria-label="更多"
                  @click.stop
                >
                  <Ellipsis :size="12" />
                </button>
                <template #dropdown>
                  <el-dropdown-menu class="page-frame-course-menu__panel">
                    <el-dropdown-item
                      v-for="m in course.menus"
                      :key="m.key"
                      :command="m.key"
                      :divided="m.divided"
                      :disabled="m.disabled"
                      :class="{ 'is-danger': m.danger }"
                    >
                      {{ m.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <!-- 信息区（课程名 + 元信息）可整块替换：封面图、更多入口、蒙层与
                   定位仍由源头给，业务方只换这块文字内容（如换成班级/学期等自有字段）。
                   作用域暴露 course，替换内容可直接取用数据、不必自己再传一份。 -->
              <div class="page-frame__course-info">
                <slot name="course-info" :course="course">
                  <p class="page-frame__course-name">{{ course.name }}</p>
                  <p v-if="course.meta?.length" class="page-frame__course-meta">
                    <template v-for="(m, i) in course.meta" :key="i">
                      <span v-if="i > 0" class="page-frame__course-meta-divider">|</span>
                      <span>{{ m }}</span>
                    </template>
                  </p>
                </slot>
              </div>
            </div>
          </slot>

          <nav class="page-frame__nav">
            <template v-for="(group, gi) in visibleMenus" :key="gi">
              <!-- 收起态不渲染分组小标题：64px 宽放不下，标题改由 hover 浮层给出 -->
              <p v-if="group.title && !collapsed" class="page-frame__group-title">{{ group.title }}</p>
              <template v-for="item in group.items" :key="item.key">
                <!-- 收起态（可展开项）：图标触发 el-dropdown（基础组件），面板补回窄态下
                     丢失的层级——抬头 = 该一级项自身名称，选项 = 其下二级项。
                     触发器 = 图标方块（属"紧凑场景用纯图标触发"档），菜单项一律用
                     el-dropdown-item——行高/圆角/hover 全在 dropdown.scss 源头；
                     抬头用源头约定类 .dropdown-group-title（灰小字，与选项拉开层级）。 -->
                <el-dropdown
                  v-if="collapsed && item.children?.length"
                  placement="right-start"
                  trigger="hover"
                  popper-class="page-frame-flyout"
                  @command="onFlyoutCommand"
                >
                  <div
                    class="page-frame__item"
                    :class="{ 'is-active': isItemActive(item) }"
                    @click="onItemClick(item)"
                  >
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      class="page-frame__item-icon"
                      :active="isItemActive(item)"
                    />
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <!-- 抬头 = 一级项名称：非可选项，故不是 dropdown-item，只作面板抬头 -->
                      <li class="dropdown-group-title">{{ item.label }}</li>
                      <el-dropdown-item
                        v-for="child in item.children"
                        :key="child.key"
                        :command="child.key"
                        :class="{ 'is-active': active === child.key }"
                      >{{ child.label }}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>

                <!-- 收起态（不可展开项）：无下级可列，弹面板等于只放一个自己＝多余一层点击。
                     纯图标入口按规范一律配 el-tooltip 补全称即可（placement 右侧：侧栏贴左边） -->
                <el-tooltip
                  v-else-if="collapsed"
                  :content="item.label"
                  placement="right"
                  :show-after="300"
                >
                  <div
                    class="page-frame__item"
                    :class="{ 'is-active': isItemActive(item) }"
                    @click="onItemClick(item)"
                  >
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      class="page-frame__item-icon"
                      :active="isItemActive(item)"
                    />
                  </div>
                </el-tooltip>

                <!-- 展开态：原有完整形态（图标 + 文字 + 可折叠子菜单） -->
                <template v-else>
                  <div
                    class="page-frame__item"
                    :class="{ 'is-active': !item.children?.length && active === item.key }"
                    @click="onItemClick(item)"
                  >
                    <component
                      :is="item.icon"
                      v-if="item.icon"
                      class="page-frame__item-icon"
                      :active="!item.children?.length && active === item.key"
                    />
                    <span class="page-frame__item-label">{{ item.label }}</span>
                    <ChevronDown
                      v-if="item.children?.length"
                      :size="16"
                      class="page-frame__item-arrow"
                      :class="{ 'is-open': openKeys.has(item.key) }"
                    />
                  </div>
                  <!-- 子菜单：EP 折叠过渡（基础组件，全局注册），展开/收起带高度动效 -->
                  <el-collapse-transition v-if="item.children?.length">
                    <div v-show="openKeys.has(item.key)" class="page-frame__subitems">
                      <div
                        v-for="child in item.children"
                        :key="child.key"
                        class="page-frame__subitem"
                        :class="{ 'is-active': active === child.key }"
                        @click="onChildClick(child, item)"
                      >{{ child.label }}</div>
                    </div>
                  </el-collapse-transition>
                </template>
              </template>
            </template>

            <!-- ========== 「更多」入口：收纳不常用导航，在队列末尾 ==========
                 由 `show-more` 控制是否启用（默认关闭）：不是所有系统都需要收纳机制，
                 导航本就精简的系统多一个空入口反而是噪音。关闭时入口不渲染，
                 已收纳的项由 effectiveMoreKeys 一并放回主导航（数据保留，重开即恢复）。
                 浮层用 el-popover 而非 el-dropdown：它不是「一列命令，点一个就收」的菜单，
                 而是一块自定义内容面板（抬头 + 标题 + ⚙ 入口 + 可滚条目列），
                 属于 popover「自定义内容浮层」的职责。
                 ⚠ 用 dropdown 承载曾被迫把 trigger 钉成 contextmenu（本场景不触发的事件）
                   来接管显隐；换 popover 后有受控的 :visible，显隐直接由状态表达。
                 ⚠ 仍保留的一条：编辑态常驻、只由取消/保存退出，故 hover 只在浏览态驱动显隐。
                 ⚠ placement 用 `right-start`（顶边对齐入口），不是居中的 `right`：
                   本面板高度会变（两态切换、增删已选项），居中对齐时高度一变就上下同时伸展、
                   整个面板跟着位移；顶边对齐则顶部不动、只向下生长，视觉上稳得多。
                 ⚠ offset 的锚点是**导航项**、不是侧栏边缘：导航项相对侧栏有 12px 内缩，
                   故 popper 默认落在侧栏内部、压着侧栏。偏移补成 20（= 内缩 12 +
                   EP 自带 8）后，面板左缘正好落在侧栏右缘上，与内容区同起一条竖线。 -->
            <el-popover
              v-if="showMore"
              ref="morePopoverRef"
              :visible="moreVisible"
              placement="right-start"
              :show-arrow="false"
              trigger="click"
              :popper-class="['page-frame-more', { 'is-collapsed': collapsed }]"
              :popper-options="MORE_POPPER_OPTIONS"
              width="auto"
            >
              <template #reference>
                <!-- 当前选中项被收进「更多」时，入口自身高亮——否则侧栏里没有任何一项亮着，
                     看起来像"没选中"（同收起态浮层 isItemActive 的处理） -->
                <div
                  class="page-frame__item page-frame__more"
                  :class="{ 'is-active': isMoreActive }"
                  @mouseenter="onMoreEnter"
                  @mouseleave="onMoreLeave"
                >
                  <!-- 双态图标：两张叠放同一格、切 opacity 交叉渐变。
                       用 v-html 换内容的话 DOM 是整体替换、没有可过渡的中间态，只能硬切。 -->
                  <span class="page-frame__item-icon page-frame__more-icon">
                    <span
                      class="page-frame__more-icon-img"
                      :class="{ 'is-on': !isMoreActive }"
                      v-html="moreIconSvg"
                    />
                    <span
                      class="page-frame__more-icon-img"
                      :class="{ 'is-on': isMoreActive }"
                      v-html="moreIconActiveSvg"
                    />
                  </span>
                  <span v-if="!collapsed" class="page-frame__item-label">{{ moreText }}</span>
                </div>
              </template>

              <!-- 面板被 teleport 到 body，入口上的 mouseenter/leave 覆盖不到它，
                   故这里再挂一份：鼠标进面板要取消待关闭，离开面板才真的关。 -->
              <div
                class="page-frame-more__panel"
                @mouseenter="onMoreEnter"
                @mouseleave="onMoreLeave"
              >
                <!-- 抬头行：本面板的标题（非菜单分组抬头，故不用 .dropdown-group-title
                     的灰小字档），右侧挂操作（浏览态=编辑 / 编辑态=取消+保存） -->
                <div class="page-frame-more__head">
                  <span class="page-frame-more__title">{{ moreText }}</span>
                  <!-- 纯图标入口：按规范必须配 tooltip 给出全称，否则语义靠猜。
                       点击调起配置弹窗（不再在面板内就地编辑）——面板宽 160，
                       放不下「已展示 / 已收纳」两栏对照，搬运时看不到全局。 -->
                  <el-tooltip content="编辑" :show-after="300">
                    <el-button text @click="openNavConfig">
                      <template #icon><Settings :size="16" :stroke-width="2" /></template>
                    </el-button>
                  </el-tooltip>
                </div>

                <!-- 收纳项多时在**主体内部**滚，滚动条走 el-scrollbar（自绘条浮在内容上、
                     不占布局宽度）。⚠️ 不是给面板写 overflow:auto——那是原生条，Chrome 下
                     占位、从布局里真切走一列，且 track 白底去不掉（见 scrollbar.scss）。
                     抬头留在滚动区**之外**，故天然常驻、不需要 sticky。 -->
                <el-scrollbar class="page-frame-more__scroll" view-class="page-frame-more__body">
                  <div class="page-frame-more__body-inner">
                <!-- 条目复用侧栏浮层的菜单项观感（行高/圆角/hover 全在源头）。
                     面板只剩浏览态——编辑已移入配置弹窗（见下方 el-dialog）。 -->
                <div
                  v-for="item in moreItems"
                  :key="item.key"
                  class="page-frame-more__item"
                  :class="{ 'is-active': active === item.key }"
                  @click="onMoreItemClick(item)"
                >{{ item.label }}</div>
                <div v-if="!moreItems.length" class="page-frame-more__empty">
                  将不常用的功能收进来
                </div>
                  </div>
                </el-scrollbar>
              </div>
            </el-popover>
          </nav>
        </el-scrollbar>

        <!-- ========== 侧栏底部用户区：帮助 / 消息 / 头像 ==========
             在滚动区之外，恒贴侧栏底缘（导航再长也不被顶走）。
             展开态分列两端：左 = 身份区（头像 + 用户名），右 = 功能图标组（帮助 / 消息）——
             身份是"我是谁"、图标是"能做什么"，两类性质不同，分开比并排更好读。
             收起态（64px）竖排成一列，用户名自动隐藏——40px 宽塞不下名字，也塞不下三个并排，
             与导航项收起成方块是同一套口径。
             两个追加位在整排的首尾，供业务方放自己的入口。 -->
        <div class="page-frame__userbar">
          <slot name="sidebar-bottom" />
          <!-- 头像：传了 avatarMenus 即包 el-dropdown 出下拉，否则仍是纯点击入口。
               ⚠️ 菜单项文案由业务方传——「我的好友」「模型备案信息」这类是各系统
                  自己的功能，框架写死会让没有该功能的系统多出无效项。
               trigger="hover"：头像是身份入口、不是命令按钮，悬停即看到能去哪，
               与侧栏收起态 hover 出浮层同一套口径。
               placement="top-start"：头像恒在侧栏最底部，只有向上才有展开空间——
               向右会把面板压在导航上、挡住整条侧栏（收起态浮层向右是因为它挂在
               导航项上、右侧就是内容区，两者位置不同，方向不能照抄）。 -->
          <el-dropdown
            v-if="(avatarRole || avatarSrc) && avatarMenus.length"
            class="page-frame__avatar-menu"
            placement="top-start"
            trigger="hover"
            popper-class="page-frame-avatar-menu"
            @command="onAvatarCommand"
          >
            <div class="page-frame__avatar" @click="emit('avatar-click')">
              <UserAvatar :role="avatarRole" :src="avatarSrc" :size="28" />
              <span v-if="userName" class="page-frame__user-name">{{ userName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="page-frame-avatar-menu__panel">
                <el-dropdown-item
                  v-for="item in avatarMenus"
                  :key="item.key"
                  :command="item.key"
                  :divided="item.divided"
                  :disabled="item.disabled"
                  :class="{ 'is-danger': item.danger }"
                >
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div
            v-else-if="avatarRole || avatarSrc"
            class="page-frame__avatar"
            @click="emit('avatar-click')"
          >
            <UserAvatar :role="avatarRole" :src="avatarSrc" :size="28" />
            <span v-if="userName" class="page-frame__user-name">{{ userName }}</span>
          </div>
          <!-- 右侧功能图标组：帮助 / 消息。与左侧身份区（头像 + 名字）分列两端。
               纯图标入口无文字标签，一律用 el-tooltip 补全称。
               placement 统一 top：用户区恒在侧栏最底部，向下没有空间；
               向右会压在内容区上（原在顶栏时为 bottom，位置变了方向也要跟着变）。 -->
          <div class="page-frame__userbar-actions">
            <el-tooltip v-if="showHelp" :content="helpText" placement="top" :show-after="300">
              <button
                type="button"
                class="page-frame__icon-btn"
                @click="emit('help-click')"
              >
                <CircleHelp :size="18" />
              </button>
            </el-tooltip>
            <!-- 徽标挂图标：el-badge 直接包裸图标（EP 原生定位贴图标右上角，见 badge.scss 使用约定），
                 28px 热区由外层按钮提供，badge 不包按钮——包按钮会让徽标锚到热区角上、飘离铃铛 -->
            <el-tooltip v-if="showNotice" :content="noticeText" placement="top" :show-after="300">
              <button
                type="button"
                class="page-frame__icon-btn"
                @click="emit('notice-click')"
              >
                <el-badge :value="noticeCount" :max="99" :hidden="!noticeCount">
                  <Bell :size="18" />
                </el-badge>
              </button>
            </el-tooltip>
            <slot name="sidebar-bottom-end" />
          </div>
        </div>
      </aside>

      <!-- ==================== 主区（内容卡） ====================
           框架不再提供顶栏：面包屑等层级返回由业务在内容区自行处理
           （需要时在 #page-header 或内容里用业务组件 Breadcrumb）。 -->
      <div class="page-frame__main">
        <!-- 内容区：白底内容卡（直角、四边无外边距，直接铺满主区），内部分「不滚的页头」+「滚动区」两段。
             #page-header 在滚动容器**之外**：只放含页面级 tab 的工具栏（须常驻），
             于是滚动条轨道只覆盖真正会滚的内容（放进滚动区里则轨道会连页头一起算进去）。
             留白仍归业务层：本框架不给内边距，页头与内容各自给。 -->
        <main class="page-frame__content">
          <div v-if="$slots['page-header']" class="page-frame__page-header">
            <slot name="page-header" />
          </div>
          <!-- 滚动区：scroll-fill 让 wrap/view 撑满，内容不满一屏时页内空态仍能垂直居中 -->
          <el-scrollbar class="page-frame__scroll-area scroll-fill" view-class="page-frame__scroll-area-view">
            <slot />
          </el-scrollbar>
        </main>
      </div>
    </div>

    <!-- ==================== 「更多」配置弹窗（双栏搬运） ====================
         左栏＝当前展示在侧栏里的项，右栏＝已收进「更多」的项，⊖/⊕ 互相搬运。
         改动落在草稿上，点「确认」才 emit（取消/关闭＝丢弃）。
         ⚠️ 宽度取三档里的 800：内容是两栏并列的**列表**（非表单），正是 800 档场景。
         ⚠️ 不用 el-transfer（勿用清单已停用）——且这里的项带层级（二级项要缩进连线），
            el-transfer 只吃扁平列表，装不下。 -->
    <el-dialog
      v-model="navConfigVisible"
      title="导航设置"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="page-frame-nav-config">
        <!-- 左栏：已展示（＝全部可收纳项里、不在草稿中的），保持 menus 原顺序 -->
        <div class="page-frame-nav-config__col">
          <p class="page-frame-nav-config__col-title">已展示的导航项</p>
          <el-scrollbar ref="navConfigShownScroll" class="page-frame-nav-config__scroll">
            <!-- 增删过渡：离场原位淡出、其余项平滑补位（move-class 由 Vue 自动挂）。
                 ⚠️ tag="div" 让容器实体化，列间距 gap 才落在组内各项之间。 -->
            <TransitionGroup
              tag="div"
              name="nav-config"
              class="page-frame-nav-config__list"
              @enter="onNavRowEnter"
              @after-enter="onNavRowClear"
              @enter-cancelled="onNavRowClear"
              @leave="onNavRowLeave"
              @after-leave="onNavRowClear"
              @leave-cancelled="onNavRowClear"
            >
              <!-- 整行即热区：可搬运的行渲染成 <button>（整条可点、键盘可达），
                   不可搬运的父项渲染成 <div>（纯结构上下文，点了没有任何事发生）。
                   ⚠️ 图标不再是独立 <button>——按钮不能嵌按钮（非法 HTML，
                      且会出现"点图标"与"点整行"两个热区互相打架）。 -->
              <component
                :is="row.movable ? 'button' : 'div'"
                v-for="row in navConfigShown"
                :key="row.key"
                :type="row.movable ? 'button' : undefined"
                class="page-frame-nav-config__item"
                :class="{ 'is-child': row.isChild, 'is-actionable': row.movable }"
                :aria-label="row.movable ? `把「${row.label}」收进更多` : undefined"
                @click="row.movable && navConfigHide(row.key)"
              >
                <!-- 二级项左侧竖线：表达隶属关系，连续多条自动接成通线 -->
                <span v-if="row.isChild" class="page-frame-nav-config__child-rail" />
                <span class="page-frame-nav-config__item-label">{{ row.label }}</span>
                <!-- 可折叠父项不渲染 ⊖：它不可跳转，收进「更多」点了没反应，
                     在这里只作为子项的结构上下文出现（同 flatSelectable 的口径）。 -->
                <span v-if="row.movable" class="page-frame-nav-config__move is-remove">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="8" fill="currentColor" />
                    <path d="M4 8h8" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </span>
              </component>
              <p v-if="!navConfigShown.length" key="__empty" class="page-frame-nav-config__empty">
                导航项已全部收进「更多」
              </p>
            </TransitionGroup>
          </el-scrollbar>
        </div>

        <!-- 右栏：已收进「更多」（＝草稿），按收纳顺序排 -->
        <div class="page-frame-nav-config__col">
          <p class="page-frame-nav-config__col-title">收进「{{ moreText }}」中的导航项</p>
          <el-scrollbar ref="navConfigHiddenScroll" class="page-frame-nav-config__scroll">
            <TransitionGroup
              tag="div"
              name="nav-config"
              class="page-frame-nav-config__list"
              @enter="onNavRowEnter"
              @after-enter="onNavRowClear"
              @enter-cancelled="onNavRowClear"
              @leave="onNavRowLeave"
              @after-leave="onNavRowClear"
              @leave-cancelled="onNavRowClear"
            >
              <!-- 整行即热区，同左栏；右栏每一项都可搬回，故一律是 <button> -->
              <button
                v-for="row in navConfigHidden"
                :key="row.key"
                type="button"
                class="page-frame-nav-config__item is-actionable"
                :aria-label="`把「${row.label}」移回导航`"
                @click="navConfigShow(row.key)"
              >
                <span class="page-frame-nav-config__item-label">{{ row.label }}</span>
                <span class="page-frame-nav-config__move">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="8" fill="currentColor" />
                    <path d="M4 8h8M8 4v8" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </span>
              </button>
              <p v-if="!navConfigHidden.length" key="__empty" class="page-frame-nav-config__empty">
                点击左侧导航项收进「更多」
              </p>
            </TransitionGroup>
          </el-scrollbar>
        </div>
      </div>

      <template #footer>
        <el-button @click="navConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNavConfig">确认</el-button>
      </template>
    </el-dialog>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
// ElMessage 是函数式调用，拿不到自动按需导入，必须显式引
import { ElMessage } from 'element-plus'
import { House, ChevronDown, ChevronLeft, CircleHelp, Bell, Settings, Ellipsis } from 'lucide-vue-next'
import { UserAvatar, type AvatarRole } from '../UserAvatar'
import type { PageFrameMenuGroup, PageFrameMenuItem, PageFrameMenuChild, PageFrameCourse, PageFrameAvatarMenuItem, PageFrameCourseMenuItem } from './types'
// 组件自包含资源：课程卡缺省封面（使用方不传 cover 时用它，无需在自己项目放图）
import defaultCover from './assets/course-cover-default.png'
// 「更多」入口图标：双态切图，与侧栏其它导航项的选中观感一致。
// ?raw 内联而非 <img>：svg 已洗成 currentColor，只有内联才接得住 __item-icon 的图标色令牌。
import moreIconSvg from './assets/more.svg?raw'
import moreIconActiveSvg from './assets/more-active.svg?raw'

const props = withDefaults(defineProps<{
  /** 侧边导航分组 */
  menus: PageFrameMenuGroup[]
  /** 侧边栏顶部课程卡；不传则不渲染 */
  course?: PageFrameCourse
  /** 侧边栏顶部返回按钮文案；空串隐藏 */
  backText?: string
  /** 侧栏底部帮助图标 */
  showHelp?: boolean
  /** 帮助图标的 tooltip 文案（纯图标入口必须有全称，故不允许空串） */
  helpText?: string
  /** 侧栏底部通知铃铛 */
  showNotice?: boolean
  /** 通知铃铛的 tooltip 文案（同上，不允许空串） */
  noticeText?: string
  /** 通知未读数（0 隐藏红点） */
  noticeCount?: number
  /** 头像（透传 UserAvatar）；role/src 都不传则不渲染 */
  avatarRole?: AvatarRole
  avatarSrc?: string
  /** 头像下拉菜单项；不传（或空数组）则头像只是纯点击入口，不出下拉 */
  avatarMenus?: PageFrameAvatarMenuItem[]
  /** 头像右侧的用户名；不传则只显示头像。收起态（64px 放不下）自动隐藏 */
  userName?: string
  /** 是否启用「更多」入口（收纳不常用导航）；关闭时入口与已收纳项一并回到主导航 */
  showMore?: boolean
  /** 「更多」入口文案 */
  moreText?: string
  /** 已收进「更多」的导航项 key（v-model:more-keys，保存时才提交） */
  moreKeys?: string[]
  /**
   * 只渲染主内容区（page-frame__content 白卡）：不渲染侧边栏、不套横向滚动壳、
   * 不吃 1200 最小宽度，且白卡四边 margin 归零、直接铺满承载容器。
   * 用于「内容区被单独嵌进宿主页面」——外壳导航由宿主提供，只复用本框架的内容卡。
   * ⚠️ 此模式下侧边栏相关 props / emits / 插槽全部不生效；留白归承载方。
   */
  contentOnly?: boolean
}>(), {
  backText: '我教的课',
  showMore: false,
  contentOnly: false,
  moreText: '更多',
  moreKeys: () => [],
  avatarMenus: () => [],
  showHelp: true,
  helpText: '帮助中心',
  showNotice: true,
  noticeText: '消息提醒',
  noticeCount: 0,
})

/** 当前选中菜单 key（v-model:active） */
const active = defineModel<string>('active')

/** 侧边栏是否收起（v-model:collapsed；使用方不传也能用，组件内部自管状态） */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const emit = defineEmits<{
  /** 选中某菜单项（含子项）；父项的展开/收起不触发 */
  'menu-select': [key: string, item: PageFrameMenuItem | PageFrameMenuChild]
  'back-platform': []
  'course-click': []
  'help-click': []
  'notice-click': []
  'avatar-click': []
  /** 点击头像下拉里的某一项（业务方据 key 分发） */
  'avatar-menu-click': [key: string, item: PageFrameAvatarMenuItem]
  /** 点击课程卡「更多」下拉里的某一项（业务方据 key 分发） */
  'course-menu-click': [key: string, item: PageFrameCourseMenuItem]
  /** 侧边栏收起 / 展开切换 */
  'collapse-change': [collapsed: boolean]
  /** 「更多」收纳项变更（点保存才触发，取消不提交） */
  'update:moreKeys': [keys: string[]]
  /** 点击「更多」面板里的某一项 */
  'more-select': [key: string, item: PageFrameMenuItem]
}>()

/** 鼠标是否停留在侧栏上（决定收起把手是否浮出） */
const sidebarHover = ref(false)

/** 移开侧栏后把手的延迟消失计时器：鼠标离开不立即收，留 0.2s 反悔窗口——
 *  把手贴在侧栏右缘，鼠标从侧栏移向它的路径上很容易先划出侧栏边界，
 *  立即消失会让人"够不着"这个按钮。进入时清掉待执行的隐藏。 */
let handleHideTimer: ReturnType<typeof setTimeout> | undefined

const onSidebarEnter = () => {
  clearTimeout(handleHideTimer)
  sidebarHover.value = true
}

const onSidebarLeave = () => {
  clearTimeout(handleHideTimer)
  handleHideTimer = setTimeout(() => {
    sidebarHover.value = false
  }, 200)
}

onBeforeUnmount(() => clearTimeout(handleHideTimer))

/* ==================== 收起 / 展开：只由用户决定 ====================
   ⛔ **不做窄屏自动折叠**——曾按视口 < 1440 自动收起，已于 2026-09 移除。
      去掉的理由：侧边导航的收放是**用户的显式选择**，系统不该替他做决定。
      自动折叠看起来"聪明"，代价是用户拖动窗口、外接显示器切换、分屏时，
      侧栏会在他没操作的情况下自己变形，反而失去可预期性——
      而「一致性高于创意 / 可预测性比新鲜感更重要」是本设计系统的设计原则之一。
   ⚠️ 因此这里**不监听 resize、不读 window.innerWidth**，也不需要「用户是否手动
      切换过」的锁（原 userToggled）——没有自动行为要让位，锁自然也没有存在意义。
   ⚠️ 需要「记住用户偏好」的项目：自己传 v-model:collapsed 并持久化即可，
      组件不再有任何会覆盖它的内部逻辑（这正是去掉自动折叠后多出来的确定性）。 */

/** 「更多」面板 hover 关闭的延迟定时器（声明在此以便卸载时清理，用法见下方 onMoreLeave） */
let moreHoverTimer: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => {
  clearTimeout(moreHoverTimer) // 待关闭的定时器不能跨卸载留着
  morePanelRO?.disconnect()
})

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('collapse-change', collapsed.value)
}

/* ==================== 「更多」入口：收纳不常用导航 ====================
   收进「更多」的项从主导航里消失、只在 hover 浮层里出现。
   浮层**只有浏览态**（列出已收纳项，点即跳转）；增删配置走 ⚙ 调起的配置弹窗
   （见下方 navConfig* ）——面板宽 160，放不下「已展示 / 已收纳」两栏对照，
   在里面就地增删看不到全局，故把编辑搬进 800 档弹窗。 */
/** 「更多」入口自身是否高亮：当前选中项被收进「更多」时入口亮起，
 *  否则侧栏里没有任何一项亮着、看起来像"没选中"。
 *  提成 computed 而非在模板里写两遍——选中态 class 与双态图标都要用它。 */
/** 实际生效的收纳 key：关掉「更多」时恒为空 —— 已收纳的项必须回到主导航，
 *  否则它们既不在主导航、也没有浮层入口，会彻底从界面上消失。
 *  只在读取时清空、不动 moreKeys 数据本身，重新开启即原样恢复。 */
const effectiveMoreKeys = computed(() => (props.showMore ? props.moreKeys : []))

const isMoreActive = computed(() => !!active.value && effectiveMoreKeys.value.includes(active.value))
/** 浮层显隐：popover 走受控 visible，两态行为直接用状态表达（无需 EP 实例句柄） */
const moreVisible = ref(false)

/** 面板横向偏移：让面板左缘正好落在侧栏右缘上，与内容区同起一条竖线。
 *  20 = 导航项相对侧栏的内缩 12（spacing-3）+ EP popper 自带的 8 基础间距。
 *  popper 的锚点是**导航项**而非侧栏边缘，不补这一段面板会压进侧栏里。
 *  ⚠️ 锚点是**导航项**，而导航项的内缩两态同为 spacing-3，故补偿不分档。
 *    侧栏自身左右内边距（展开 16 / 收起 12）不参与此式——别看见侧栏改宽就跟着调。 */
/** popover 实例：两态切换后要手动让它重算位置（见下方 watch） */
const morePopoverRef = ref<{ popperRef?: { popperInstanceRef?: { update?: () => void } } } | null>(null)

const MORE_OFFSET = 20
/** ⚠️ 必须是模块级常量、不能在模板里写对象字面量：字面量每次渲染都是新对象，
 *  EP 会据此重建 popper 实例并重算位置——表现为关闭瞬间面板先跳一下（实测 6px）再淡出。 */
const MORE_POPPER_OPTIONS = {
  modifiers: [{ name: 'offset', options: { offset: [0, MORE_OFFSET] } }],
}

/** 课程卡「更多」面板：右侧展开、顶边与卡片对齐（right-start）。
 *  ⚠️ 本值按实际观感调定，不是从侧栏几何推出来的——锚点是贴在课程卡右缘的按钮，
 *  而课程卡比侧栏窄一截，光靠 popper 默认间距面板会压在侧栏上。
 *  与「更多」浮层的 20 不能共用：那个锚点是导航项（相对侧栏内缩 spacing-3），
 *  锚点不同 → 补偿不同，别看见同一条竖线就照抄另一处的值。
 *  ⚠️ 不按收起态分档：课程卡只在展开态渲染（见模板 v-if="!collapsed"），
 *  收起态根本没有这个入口，一个值即可。 */
const COURSE_MENU_OFFSET = 22

const COURSE_MENU_POPPER_OPTIONS = {
  modifiers: [{ name: 'offset', options: { offset: [0, COURSE_MENU_OFFSET] } }],
}

/** 全部「可收纳项」的扁平索引：一级项（不含可折叠父项本身）+ 二级项。
 *  ⚠️ 可折叠父项自身不可收——它不可跳转、收进来点了没反应；但它的子项可以，
 *  子项被收光时父项会自动隐藏（见 visibleMenus）。
 *  一处算好供候选 / 已选 / 回显共用，避免同一套规则在四处各写一遍。 */
const flatSelectable = computed<(PageFrameMenuItem | PageFrameMenuChild)[]>(() =>
  props.menus.flatMap((g) =>
    g.items.flatMap((i) => (i.children?.length ? i.children : [i])),
  ),
)

/** 收进「更多」的项（按 moreKeys 顺序取，保证与用户配置的顺序一致） */
const moreItems = computed(() =>
  effectiveMoreKeys.value
    .map((key) => flatSelectable.value.find((i) => i.key === key))
    .filter((i): i is PageFrameMenuItem | PageFrameMenuChild => !!i),
)

/** 主导航：剔掉已收进「更多」的项。两层都要剔：
 *  · 一级项被收 → 该项不渲染
 *  · 可折叠父项的子项被收光 → 父项自己也不再渲染（空壳父项点开什么都没有）
 *  整组被收空时该组连标题一起不渲染。 */
const visibleMenus = computed<PageFrameMenuGroup[]>(() =>
  props.menus
    .map((g) => ({
      ...g,
      items: g.items
        .map((i) =>
          i.children?.length
            ? { ...i, children: i.children.filter((c) => !effectiveMoreKeys.value.includes(c.key)) }
            : i,
        )
        // 可折叠父项：子项被收光即整项隐藏；普通一级项：自身被收才隐藏
        .filter((i) =>
          i.children ? i.children.length > 0 : !effectiveMoreKeys.value.includes(i.key),
        ),
    }))
    .filter((g) => g.items.length),
)

/* 面板的 hover 开关由本组件驱动（popover 走受控 visible）。
   关闭留一段延迟：入口与面板之间有间隙，鼠标划过去的路上会先离开入口，
   立即关会让人"够不着"面板（同侧栏收起把手的处理思路）。 */
/** 头像下拉：EP 的 command 只给 key，这里补回整项再抛给业务方（省得它自己再查一遍） */
const onAvatarCommand = (key: string) => {
  const item = props.avatarMenus.find(m => m.key === key)
  if (item) emit('avatar-menu-click', key, item)
}

const onCourseCommand = (key: string) => {
  const item = props.course?.menus?.find(m => m.key === key)
  if (item) emit('course-menu-click', key, item)
}

const onMoreEnter = () => {
  clearTimeout(moreHoverTimer)
  moreVisible.value = true
}
const onMoreLeave = () => {
  clearTimeout(moreHoverTimer)
  moreHoverTimer = setTimeout(() => { moreVisible.value = false }, 200)
}


/* 面板内容高度会变（收纳项增删后条目数不同），但 popper 不会自己跟着重算位置——
   placement="right-end" 是按底缘对齐入口的，高度变了面板就该向上生长、底缘不动，
   不重算则整块跟着飘（实测：加一项后偏 22px），且这偏差要等到关闭时
   popper 才重算，表现为「关闭瞬间先跳一下再消失」。
   ⚠️ 用 ResizeObserver 而非 watch 某个状态：高度变化的来源不止一处，
   盯单一状态会漏（已踩过）。 */
let morePanelRO: ResizeObserver | undefined
const observeMorePanel = () => {
  morePanelRO?.disconnect()
  const panel = document.querySelector('.page-frame-more__panel')
  if (!panel) return
  morePanelRO = new ResizeObserver(() => {
    morePopoverRef.value?.popperRef?.popperInstanceRef?.update?.()
  })
  morePanelRO.observe(panel)
}

/* 面板挂载/卸载时接上或断开观察（面板由 v-if 控制，不常驻 DOM） */
watch(moreVisible, (visible) => {
  if (visible) nextTick(() => {
    observeMorePanel()
    resetMoreScroll()
  })
  else { morePanelRO?.disconnect(); morePanelRO = undefined }
})

/** 每次打开面板都把收纳项列表滚回顶部。
 *  ⚠️ 不加这一条时，滚动位置会留在上次关闭时的地方——面板是同一个 DOM
 *  （popover 关闭只是隐藏、不销毁内容），下次打开就从半截开始，看不到第一项。
 *  ⚠️ 要改的是 el-scrollbar 内部的 wrap（真正在滚的那一层），
 *  给外壳设 scrollTop 不起作用。 */
const resetMoreScroll = () => {
  const wrap = document.querySelector(
    '.page-frame-more__scroll .el-scrollbar__wrap',
  ) as HTMLElement | null
  if (wrap) wrap.scrollTop = 0
}

/* ==================== 「更多」配置弹窗：双栏搬运 ====================
   点面板抬头的 ⚙ 调起。左栏＝当前展示在侧栏的项、右栏＝已收进「更多」的项，
   ⊖/⊕ 互相搬运，改动落在草稿上，点「确认」才 emit。 */
/** 弹窗显隐 */
const navConfigVisible = ref(false)
/* 两栏滚动区的句柄：每次打开弹窗要把滚动位置归零（见 openNavConfig）。
   ⚠️ el-dialog 默认不销毁已渲染的内容，不手动归零就会保留上次关闭前的
      滚动位置——再打开时看到的是半截列表，而不是从第一项开始。 */
type ScrollHandle = { setScrollTop: (n: number) => void; update: () => void }
const navConfigShownScroll = ref<ScrollHandle | null>(null)
const navConfigHiddenScroll = ref<ScrollHandle | null>(null)
/** 草稿：这次编辑中「已收进更多」的 key 列表；取消 / 关闭即丢弃 */
const navConfigDraft = ref<string[]>([])

/** 弹窗里一行的数据。
 *  · isChild —— 是否二级项（决定缩进并画竖线）
 *  · movable —— 是否可搬运（决定渲染不渲染 ⊖/⊕）：**可折叠父项自身不可收**，
 *    它不可跳转、收进「更多」点了没反应，故只作为**结构上下文**出现、不给搬运按钮。 */
interface NavConfigRow {
  key: string
  label: string
  isChild: boolean
  movable: boolean
}

/** 全部导航项按 menus 的原始顺序摊平，**父项与子项都保留**。
 *  ⚠️ 与 flatSelectable 的区别不只是多两个字段：那个回答的是"哪些项可被收纳"，
 *  故可折叠父项被整个跳过、只留 children；**本列表回答的是"侧栏长什么样"**，
 *  父项必须留着，否则它的子项会贴到上一个一级项下面、看起来像那一项的子级
 *  （真实翻车：「分组管理」「直播课堂」被跳过后，它们的子项缩进显示在了
 *   上一项「课程题库」下方，弹窗里的层级与侧栏对不上）。 */
const navConfigRows = computed<NavConfigRow[]>(() =>
  props.menus.flatMap((g) =>
    g.items.flatMap((i): NavConfigRow[] =>
      i.children?.length
        ? [
            // 父项：只作结构上下文，不可搬运
            { key: i.key, label: i.label, isChild: false, movable: false },
            ...i.children.map((c): NavConfigRow => ({
              key: c.key, label: c.label, isChild: true, movable: true,
            })),
          ]
        : [{ key: i.key, label: i.label, isChild: false, movable: true }],
    ),
  ),
)

/** 左栏「已展示」：不在草稿里的，保持 menus 原顺序（不是用户搬运的顺序）——
 *  左栏对应的是侧栏实际排列，顺序必须与侧栏一致才对得上。
 *  ⚠️ 父项要跟着 visibleMenus 的规则走：**子项被收光时父项自己也不再展示**
 *  （侧栏里它已经消失了，弹窗左栏还留着就又对不上了）。 */
const navConfigShown = computed(() => {
  const hiddenParents = new Set(
    props.menus.flatMap((g) =>
      g.items
        .filter((i) => i.children?.length && i.children.every((c) => navConfigDraft.value.includes(c.key)))
        .map((i) => i.key),
    ),
  )
  return navConfigRows.value.filter(
    (r) => !navConfigDraft.value.includes(r.key) && !hiddenParents.has(r.key),
  )
})

/** 右栏「已收进更多」：按草稿顺序排（＝用户收纳的先后），与浮层里的顺序一致。
 *  ⚠️ 这里不按 menus 原顺序：浮层列表就是按 moreKeys 顺序渲染的，
 *  两处顺序不一致会让用户在弹窗里看到的排列与浮层里的对不上。
 *  二级项收进「更多」后不再缩进——它已脱离原父项、在浮层里是平级的一条。 */
const navConfigHidden = computed(() =>
  navConfigDraft.value
    .map((key) => navConfigRows.value.find((r) => r.key === key))
    .filter((r): r is NavConfigRow => !!r)
    .map((r) => ({ ...r, isChild: false })),
)

/** 打开弹窗：用当前生效值初始化草稿，并顺手收起浮层
 *  （浮层是 hover 出来的，弹窗一开鼠标就离开了它，留着会浮在遮罩上） */
const openNavConfig = () => {
  navConfigDraft.value = [...props.moreKeys]
  clearTimeout(moreHoverTimer)
  moreVisible.value = false
  navConfigVisible.value = true
  // 两栏滚动位置归零。放在 nextTick 里：此刻弹窗内容才渲染/更新完，
  // 早于它调用拿不到滚动容器（首次打开时 ref 还是 null）。
  // ⚠️ setScrollTop(0) 之后必须再调 update()：上次关闭时 scrollTop 已被
  //    浏览器复位成 0，于是这次 set 不产生任何滚动、**不触发 scroll 事件**，
  //    EP 的滑块拿不到通知、保持上次的 transform 停在半路——实测重开后
  //    内容在顶部而滑块是 translateY(212.9%)。update() 强制重算滑块位置。
  nextTick(() => {
    navConfigShownScroll.value?.setScrollTop(0)
    navConfigHiddenScroll.value?.setScrollTop(0)
    navConfigShownScroll.value?.update()
    navConfigHiddenScroll.value?.update()
  })
}

/** ⊖ 收进「更多」：追加到草稿末尾（＝右栏最下方，符合"刚搬过去"的位置预期） */
const navConfigHide = (key: string) => {
  if (navConfigDraft.value.includes(key)) return
  navConfigDraft.value = [...navConfigDraft.value, key]
}

/** ⊕ 移回导航：从草稿里剔除，它会自动回到左栏的**原始位置**（非末尾）——
 *  左栏按 menus 原顺序渲染，故搬回来即归位，无需记录原索引。 */
const navConfigShow = (key: string) => {
  navConfigDraft.value = navConfigDraft.value.filter((k) => k !== key)
}

/* 增删过渡的高度钩子：CSS 无法从 `height: auto` 过渡，必须由 JS 量出真实像素。
   ⚠️ 不能改用 max-height 省掉这段：max-height 的起点是 none，`none → 0` 不可插值；
      给个固定起点（如 60px）又会让收拢先"空跑"掉 60-40 那段，观感仍是卡一下才动。 */
const onNavRowEnter = (el: Element) => {
  const row = el as HTMLElement
  // 进场：从 0 长到真实高度。先摘掉 enter-from（它把 padding / border 归了零）
  // 再量，否则拿到的是内容高、终点会短一截；量完立刻装回去，作为插值起点。
  // ⚠️ 量之前**必须先把过渡关掉**（transition:none + 强制回流）：padding / border
  //    本身就是过渡属性，摘掉 enter-from 只是给它们换了个**终点**，计算值仍停在
  //    过渡当前值（此刻是 0）。逐帧实测过：不关过渡时 paddingTop 读到 0px、
  //    offsetHeight 只有 24（纯内容高），于是高度动画跑到 24 就结束、
  //    再于最后一帧从 24 直接跳到 42 —— 那一跳就是"展开到中间卡一下"。
  row.style.transition = 'none'
  row.classList.remove('nav-config-enter-from')
  row.style.height = ''
  void row.offsetHeight
  const target = row.offsetHeight
  row.classList.add('nav-config-enter-from')
  row.style.height = '0px'
  void row.offsetHeight
  row.style.transition = ''
  void row.offsetHeight

  // 终点高度同步写即可：Vue 会在 nextFrame（双层 rAF）里摘掉 enter-from，
  // 届时 padding / border / margin / opacity 各自从起点跑向终点，而 height 此刻
  // 已在跑——两者终点一致（target 就是含 padding/border 的完整行高），
  // 故最终同时到位，不会出现"高度先到、其余属性后补"的错位。
  row.style.height = `${target}px`
}

const onNavRowLeave = (el: Element) => {
  // 离场：先把当前高度固定成行内值作为插值起点，回流后再归零。
  // ⚠️ 必须在 leave 钩子里做，不能用 before-leave——那个在 leave-to 类挂上**之前**
  //    就跑完了，高度在第二帧就已是 0，实测幽灵全程 height:0、邻项照旧瞬移。
  const row = el as HTMLElement
  row.style.height = `${row.offsetHeight}px`
  void row.offsetHeight
  // 与进场同理：Vue 挂 leave-to（padding / border / margin / opacity 的终点）走的是
  // 双层 rAF，故归零高度也用双层对齐，两条腿同起同落。
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!row.isConnected) return
      row.style.height = '0px'
    })
  })
}

/** 过渡结束（或被打断）后清掉行内高度，交还给自然布局 */
const onNavRowClear = (el: Element) => {
  ;(el as HTMLElement).style.height = ''
}

const saveNavConfig = () => {
  emit('update:moreKeys', [...navConfigDraft.value])
  navConfigVisible.value = false
  // 弹窗关掉后改动体现在侧栏上，给一条轻提示确认「已生效」。
  // showClose 必传——源头 message.scss 定制了 Lucide 关闭按钮并强制常显，不传就看不到。
  ElMessage({ message: '设置成功', type: 'success', showClose: true })
}

/** 浏览态点收纳项：一级项与二级项都可能出现在这里（二级项没有 children，
 *  onItemClick 走选中分支即可，无需为它单独写一套）。 */
const onMoreItemClick = (item: PageFrameMenuItem | PageFrameMenuChild) => {
  // ⚠️ 点条目**不要**在这里关面板：选中态要能当场看见（被点的那项高亮），
  //    立刻收起会让反馈随面板一起消失、切换显得"闪"。面板本就是 hover 驱动
  //    （入口与面板各挂一份 enter/leave），鼠标移出后自然走 onMoreLeave 渐隐。
  emit('more-select', item.key, item as PageFrameMenuItem)
  onItemClick(item as PageFrameMenuItem)
}

/** 收起态某图标是否高亮：自身选中，或其任一子项选中（子项此时藏在浮层里） */
const isItemActive = (item: PageFrameMenuItem) =>
  active.value === item.key || !!item.children?.some((c) => c.key === active.value)

/** 收起态浮层选中某项：command 传的是 key，回查出对应项后走与展开态同一套 emit */
const onFlyoutCommand = (key: string) => {
  for (const group of props.menus) {
    for (const item of group.items) {
      if (item.key === key && !item.children?.length) return onItemClick(item)
      const child = item.children?.find((c) => c.key === key)
      if (child) return onChildClick(child, item)
    }
  }
}

/** 已展开的可折叠父项 key 集合 */
const openKeys = ref(new Set<string>())

/** 选中子项时自动展开其父项（含初始 active 命中子项的场景）。
 *  ⚠️ 已收进「更多」的子项除外：它已从父级下面移走、只在「更多」面板里出现，
 *  再把父级展开会指向一个空位置（父级下根本没有这一项），反而让人找不着。 */
watch(
  () => active.value,
  (key) => {
    if (!key || props.moreKeys.includes(key)) return
    for (const group of props.menus) {
      for (const item of group.items) {
        if (item.children?.some((c) => c.key === key)) openKeys.value.add(item.key)
      }
    }
  },
  { immediate: true },
)

const onItemClick = (item: PageFrameMenuItem) => {
  if (item.children?.length) {
    // 父项：只做展开/收起，不参与选中
    openKeys.value.has(item.key) ? openKeys.value.delete(item.key) : openKeys.value.add(item.key)
    return
  }
  active.value = item.key
  emit('menu-select', item.key, item)
}

const onChildClick = (child: PageFrameMenuChild, _parent: PageFrameMenuItem) => {
  active.value = child.key
  emit('menu-select', child.key, child)
}
</script>

<style scoped lang="scss">
/* 横向滚动壳：撑满承载容器，只负责在容器窄于最小宽度时提供横向滚动。
   底色放在这里（而非骨架上）——骨架被最小宽度撑出容器后，灰底才不会在横向滚动时露白。 */
.page-frame-shell {
  width: 100%;
  height: 100%;
  background: var(--iflyv-bg-page);
}

/* view 是 el-scrollbar 的内容层：骨架靠它撑满高度，flex 布局才有 100% 高可继承 */
:deep(.page-frame-shell__view) {
  height: 100%;
}

/* 页面框架骨架：左侧边栏 + 右主区（顶栏 + 白色内容卡），整体铺在 bg-page 灰底上。
   高度撑满承载容器（真实项目通常是 100vh 视口），侧边导航与内容区各自独立滚动。
   最小宽度 1200：窄于此值不再压缩，改由外层壳出横向滚动条（值走令牌，勿硬写）。 */
.page-frame {
  display: flex;
  width: 100%;
  min-width: var(--iflyv-layout-min-width);
  height: 100%;
  min-height: 0;
  background: var(--iflyv-bg-page);
}

/* ==================== 侧边栏 ==================== */
/* 220px 结构宽度，列向排布：返回按钮 → 课程卡 → 导航（独立滚动）。
   ⚠️ 左右 16 的内缩**不写在侧栏自身**，而是下放给各直接子项（__back / __scroll-view /
   __userbar）各自给——为的是让滚动区 .page-frame__scroll 铺到侧栏结构右缘，
   el-scrollbar 的滚动条才会贴在灰底与白卡的分界线上，而不是浮在导航文字旁边碍事。
   （滚动条由 EP 贴在滚动容器右缘，容器缩进多少它就跟着往里挪多少。）
   ⚠️ 这 16 与导航项/分组标题自身的左右内边距（12，见 __item / __group-title）是
   **两档独立的值**，有意不同源：前者是侧栏与内容区的外缘留白，后者是导航项
   hover 底板的内缩。改其中一处不要顺手把另一处对齐成同值。
   顶部内边距取 spacing-4，与左右内缩同档；子项之间的竖缝不用 gap（见下方注释）。 */
.page-frame__sidebar {
  position: relative;
  flex: 0 0 auto;
  width: 220px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* ⚠️ 有意不用 gap：侧栏竖排三个子项（返回按钮 / 滚动区 / 用户区），
     一个 gap 会同时撑开「返回按钮 ↕ 滚动区」与「滚动区 ↕ 分隔线」两条缝，
     而这两条要的值不同——前者需留白 16，后者要紧贴（导航一直排到线为止，
     否则滚动到底时空出一截、看着像没内容了）。
     故改由返回按钮自己给 margin-block-end，只撑上面那条缝。 */
  /* 左右为 0：内缩下放给子项（见本段顶部注释），滚动条才能贴侧栏右缘 */
  padding: var(--iflyv-spacing-4) 0 0;
  min-height: 0;
  transition: width var(--iflyv-duration-normal) var(--iflyv-ease-default);

  /* 收起态：64px 只容一列 40px 图标方块（左右内缩 12，同样由子项各自给）。
     ⚠️ 收起态内缩是 12（spacing-3），不跟展开态的 16 走——64 = 12+40+12 是
     图标方块的紧凑推导，改成 16 会把栏宽顶到 72、白占一截。 */
  &.is-collapsed {
    width: 64px;
  }
}

/* 收起把手：14×70 的薄片（设计稿「联集 82」原图 28×140 的 50%），
   贴侧栏右缘垂直居中，浮在内容区白卡之上。
   形状用 mask 绘制而非 <img>——设计稿给的 svg 填充是写死的 #F2F5F7，
   贴图会脱离令牌（暗色主题下不跟着变）；mask 只取形状，颜色仍由 background 走灰底令牌。 */
/* clip 壳：固定窗口，贴侧栏右缘垂直居中，兼任热区扩张层。
   ① 裁切——它不动、只负责 overflow 裁切，薄片的滑动全发生在窗口内（位移不能写在薄片自身
      的 mask/clip-path 上，那会跟着 transform 一起移动、裁不掉）；
   ② 容纳热区——薄片按钮本体被放大成 24×102 的热区（见下），壳同尺寸才不会把热区裁掉；
      薄片可见形状仍是 14×70，由 mask-size 锁死、不随按钮放大而拉伸。
      注意左侧不能扩：壳左缘就是「消失线」，往左扩会让推走的薄片露进侧栏。
      壳自身 pointer-events: none，只有内部按钮吃点击，不挡内容区。 */
.page-frame__handle-clip {
  position: absolute;
  inset-inline-end: -24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--iflyv-z-sticky);
  width: 24px;
  height: 102px;
  overflow: hidden;
  pointer-events: none;
}

/* 把手按钮 = 24×102 热区（比可见薄片四周各留出一圈，直接点薄片边缘太细），
   可见薄片仍是 14×70：mask-size 锁死尺寸不随按钮放大而拉伸，
   mask-position 让它贴热区左缘垂直居中——热区向右、上下三面无痕扩张。 */
.page-frame__handle {
  pointer-events: auto;
  width: 24px;
  height: 102px;
  padding: 0;
  border: none;
  background: var(--iflyv-bg-page);
  /* 与可折叠父项箭头同取 icon-3：两者同为侧栏里的"方向指示"图标，保持一致。
     hover 提亮到 icon-1 作为可点反馈 */
  color: var(--iflyv-icon-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  /* 图标随薄片走：靠左 14px 内居中，而非在整个热区里居中 */
  justify-content: flex-start;
  text-indent: 0;
  /* 薄片形状：左缘满高平边贴住侧栏，上下各收一道斜边、右缘为圆角竖边，
     整体向内容区凸出（设计稿「联集 82」原路径，未改比例）。
     path 与 viewBox 保持设计稿原值 28×140，实际显示尺寸由 mask-size 缩到 50%，
     等比缩放、斜边角度与圆角比例不变。 */
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='140' viewBox='0 0 28 140'%3E%3Cpath d='M0,0L0,140L19.624763,125.98232C24.880686,122.22808,28,116.16666,28,109.70764L28,30.292358C28,23.833336,24.880686,17.771919,19.624763,14.017688L0,0Z' fill='%23000'/%3E%3C/svg%3E");
  mask-repeat: no-repeat;
  mask-size: 14px 70px;
  mask-position: left center;
  /* hover 提亮渐变过色，与导航项同档，不做突变。
     只写 color——opacity/transform 归进出场的 Transition 管，写进来会打架 */
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    color: var(--iflyv-icon-1);
  }
}

/* 把手进出场：自左向右推入 / 原路反向推走 + 渐隐，全程被 clip 壳裁在窗口内。
   出现走减速曲线、消失走加速曲线（令牌语义）。
   垂直居中归 clip 壳，这里只做横向位移，不再叠 translateY */
.page-frame-handle-enter-active {
  transition:
    opacity var(--iflyv-duration-normal) var(--iflyv-ease-decelerate),
    transform var(--iflyv-duration-normal) var(--iflyv-ease-decelerate);
}

.page-frame-handle-leave-active {
  transition:
    opacity var(--iflyv-duration-normal) var(--iflyv-ease-accelerate),
    transform var(--iflyv-duration-normal) var(--iflyv-ease-accelerate);
}

/* 位移量 = 薄片可见宽度 14（非按钮宽 24，按钮多出的是透明热区，
   按 24 推会多滑一段空行程） */
.page-frame-handle-enter-from,
.page-frame-handle-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}

/* 收起态箭头翻转，指向"展开"方向。
   取色不写在这里——写死会盖掉把手按钮的 hover 提亮，见 .page-frame__handle。
   左移 2px 视觉居中：图标 16px 落在 14px 薄片里本就宽出 2px，靠左对齐后
   偏右显重；用负 margin 而非 translateX——transform 被收起态的 rotate 占着。 */
.page-frame__handle-icon {
  /* audit-ignore 光学补偿而非间距：16px 图标落在 14px 薄片里本就宽出 2px，
     且右缘还是收窄的斜边 + 圆角，靠左对齐后偏右显重；
     负 margin 是把它拉回视觉居中，与 spacing 序列无关（序列里也不存在负值）。 */
  margin-inline-start: -2px;
  transition: transform var(--iflyv-duration-fast) var(--iflyv-ease-default);

  .is-collapsed & {
    transform: rotate(180deg);
  }
}

/* 返回平台按钮：整行浅灰底块（border-subtle 6% 深色墨水铺在 gray-1 上，参考 StepBar 用描边令牌做中性填充的先例）。
   左右 margin = 侧栏内缩（侧栏自身已不给内边距，见 __sidebar 段注释）。 */
.page-frame__back {
  margin-inline: var(--iflyv-spacing-4);
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-1_5);
  /* 36 高：与下方导航项（44）拉开一档但不至于过扁，属侧栏结构性尺寸
     （同 44 / 40 / 28，无高度令牌，单点维护于各自处）。 */
  height: 36px;
  /* audit-ignore 经用户确认此处不走令牌：左右 14 落在 spacing 序列的 12 与 16 之间，
     序列无此档。按 36 高的按钮观感定值（12 偏挤、16 偏松），单点维护于此。 */
  padding: 0 14px;
  /* 与下方滚动区的唯一一条竖缝（侧栏不给 gap，见 __sidebar 段注释） */
  margin-block-end: var(--iflyv-spacing-4);
  border: none;
  border-radius: var(--iflyv-radius-sm);
  background: var(--iflyv-bg-back);
  color: var(--iflyv-text-1);
  /* 整档取用语义字阶 body-sub（14/20 regular），不再拆开基础令牌自拼档位 */
  font: var(--iflyv-font-body-sub);
  cursor: pointer;
  /* 收起/展开的那一帧宽度仍在变，此刻文字仍在 DOM 里：
     不锁 nowrap 会被挤成一列竖排字，必须裁切而非折行（同 __item-label 的处理） */
  white-space: nowrap;
  overflow: hidden;

  /* 收起态：收成 40px 方块只留图标，与下方导航图标同列对齐 */
  .is-collapsed & {
    width: 40px;
    padding: 0;
    justify-content: center;
    margin-inline: var(--iflyv-spacing-3);
  }
}

.page-frame__back-icon {
  color: var(--iflyv-icon-2);
  flex-shrink: 0;
}

/* 课程卡：16:9 封面 + 底部渐变压暗 + 白字课程名/元信息 + 右上角标 */
.page-frame__course {
  position: relative;
  /* 固定 100 高：侧栏宽度变化时不再按 16:9 抻高 */
  height: 100px;
  flex-shrink: 0;
  border-radius: var(--iflyv-radius-sm);
  overflow: hidden;
  background: var(--iflyv-ai-gradient); /* 无封面图时的缺省底 */
  cursor: pointer;
}

.page-frame__course-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右上「更多」入口：沿用原文字角标的位置与压暗底（贴卡片右上直角、内圆角），
   只把内容从文字换成图标。底色仍用遮罩令牌，保证图标在任意封面图上都可读。 */
/* 定位挂在 el-dropdown 外壳上，不是挂在 button 上：
   el-dropdown 会在触发器外再包一层 div（普通流内的 inline-block），
   只给里面的 button 定位的话，这层外壳仍占着流内位置、把卡片版面顶乱。 */
.page-frame__course-more {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  line-height: 0;
}

.page-frame__course-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--iflyv-spacing-0_5) var(--iflyv-spacing-1_5);
  border: none;
  border-radius: 0 var(--iflyv-radius-sm) 0 var(--iflyv-radius-sm);
  /* 沿用原文字角标的压暗底 + 白字，只把内容换成图标。
     ⚠️ 图标色必须是实色 text-on-dark——mask-* 是**遮罩层**令牌（半透明白/黑），
     拿它当前景色会让 stroke="currentColor" 的图标透成看不见（踩过）。
     不另做 hover 变色：深底遮罩只有 mask-primary 一档，没有可用的加深档，
     而"再造一档"属自造档位（同写裸值）。hover 反馈由 tooltip + 下拉展开给出。 */
  background: var(--iflyv-mask-primary);
  color: var(--iflyv-text-on-dark);
  cursor: pointer;
}

/* 底部信息区：向下渐变压暗保证白字可读（用遮罩令牌做渐变终点色，不硬编码黑） */
.page-frame__course-info {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: var(--iflyv-spacing-5) var(--iflyv-spacing-3) var(--iflyv-spacing-1);
  background: linear-gradient(180deg, transparent 0%, var(--iflyv-mask-primary) 100%);
  text-align: center;
  /* 定在容器而非仅子元素上：#course-info 插槽的自定义内容同样处在压暗蒙层之上，
     由此默认即拿到可读的浅色文字，业务方不必自己配色 */
  color: var(--iflyv-text-on-dark);
}

/* :slotted —— 让本规则同时命中 #course-info 插槽里由调用方写的同名元素。
   scoped 样式默认只作用于本组件模板；插槽内容带的是**调用方**的 scope id，
   不加 :slotted 的话调用方写 class="page-frame__course-name" 会完全不生效
   （静默无样式），于是被迫在自己页面里复刻一份字号字重 = 局部私货。 */
.page-frame__course-name,
:slotted(.page-frame__course-name) {
  margin: 0;
  color: var(--iflyv-text-on-dark);
  font: var(--iflyv-font-body-sub);
  font-weight: var(--iflyv-font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-frame__course-meta {
  margin: 0;
  /* 固定 20 行高：文本 14 行高上下各留 3，与课程名保持稳定节奏 */
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--iflyv-spacing-1);
  color: var(--iflyv-text-on-dark);
  /* 10/14：卡内元信息比 body-min(12) 再收一档
     TODO 待令牌化：字阶最小为 12，用户确认先硬编码 */
  font: var(--iflyv-font-body-min);
  /* audit-ignore 语义字阶最小档为 12，此处课程卡元信息需再收一档到 10/14；
     字重由上一行整档 font: body-min 提供，此处只覆盖字号行高。经用户确认先硬编码，
     待字阶体系补 10 档后回归令牌（见上方 TODO）。 */
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
}

.page-frame__course-meta-divider {
  /* audit-ignore 经用户确认此处特殊处理、不走令牌：分隔符压在课程卡封面图上，
     语义令牌 border-on-dark（白 10%）是给「深底描边」用的，压在图片上几乎看不见；
     而把它整体调亮又会让今后所有深底描边跟着变重。故此处单独硬编码白 50%——
     它既不是描边也不是文字（text-on-dark 纯白会比两侧文字还抢眼），
     当前无对应语义档位，不新增令牌。 */
  color: rgba(255, 255, 255, 0.5);
}

/* 侧栏滚动区（el-scrollbar 外壳）：课程卡 + 导航同处其中，一起滚动（课程卡不吸顶） */
.page-frame__scroll {
  flex: 1;
  min-height: 0;
}

/* 滚动内容排布放在 el-scrollbar 的 view 上（滚动发生在这一层） */
:deep(.page-frame__scroll-view) {
  display: flex;
  flex-direction: column;
  /* 与 __sidebar 的 gap 同一条结构缝（课程卡 ↕ 导航），两处必须一致，改一处要同步另一处。 */
  gap: var(--iflyv-spacing-4);
  /* 左右内缩写在 view（内容层）上而非外层 el-scrollbar：滚动条贴的是外层容器右缘，
     内缩若写在外层会把滚动条一起推离侧栏右缘——那正是本次要修的问题。 */
  padding-inline: var(--iflyv-spacing-4);
  /* ⚠️ 有意不给 padding-bottom：底部紧邻用户区分隔线，留白会在"最后一个导航项 ↕ 分隔线"
     之间空出一截，且滚动到底时那截空白让人以为已经没有内容了（实际下面还有半行被裁）。
     导航一直排到分隔线为止，滚动到底即真的到底。 */
  /* 展开过渡中导航按展开态定宽铺开（见 __nav），这里锁住 view 宽度并裁切，
     让超出的部分被侧栏遮住，而不是把滚动区撑出一条横向滚动条 */
  width: 100%;
  overflow-x: hidden;
}

/* 收起态内缩回 12（同 __back / __userbar 的收起态）。
   ⚠️ 必须另起一条而不是嵌进上面那块：`:deep()` 必须在选择器最前，
   嵌套写 `.is-collapsed &` 会编译成 `.is-collapsed :deep(…)`，scoped 属性落错位置、静默失效。 */
.page-frame__sidebar.is-collapsed :deep(.page-frame__scroll-view) {
  padding-inline: var(--iflyv-spacing-3);
}

.page-frame__nav {
  flex-shrink: 0;
  /* 展开过渡中侧栏宽度还在 64→200 之间，此刻文字已回到 DOM：
     导航整块按展开态宽度（220 - 左右 spacing-4）铺开、由侧栏 overflow 裁切，
     文字全程横排、未展开的部分被遮住（同 __group-title 的处理思路）。
     收起态交给 .is-collapsed 分支重新收成一列图标宽。 */
  width: calc(220px - var(--iflyv-spacing-4) * 2);

  .is-collapsed & {
    width: 40px;
  }
}

/* 分组小标题：与导航项文字同一左缘（spacing-3 缩进）。
   层级靠色阶（text-3）拉开，不靠缩字号——故与正文同档即可。 */
.page-frame__group-title {
  margin: var(--iflyv-spacing-4) 0 var(--iflyv-spacing-2);
  padding: 0 var(--iflyv-spacing-3);
  color: var(--iflyv-text-3);
  /* 整档取用语义字阶 body-sub（14/20 regular），不拆开基础令牌自拼档位 */
  font: var(--iflyv-font-body-sub);
  /* 收起/展开的那一帧宽度仍在变，不锁 nowrap 会折成两行 */
  white-space: nowrap;
  overflow: hidden;
}

/* 导航项：44px 行高，图标 + 文字。未选中 text-2，选中 = 加粗 + text-1（无底色，靠字重/色阶导航） */
.page-frame__item {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  height: 44px;
  padding: 0 var(--iflyv-spacing-3);
  margin-bottom: var(--iflyv-spacing-0_5);
  border-radius: var(--iflyv-radius-sm);
  color: var(--iflyv-text-2);
  font: var(--iflyv-font-body-primary);
  cursor: pointer;
  transition:
    background var(--iflyv-duration-fast) var(--iflyv-ease-default),
    color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    background: var(--iflyv-border-subtle);
  }

  &.is-active {
    color: var(--iflyv-text-1);
    font-weight: var(--iflyv-font-weight-semibold);

    .page-frame__item-icon {
      color: var(--iflyv-icon-1);
    }
  }

  /* 收起态：40px 方块只放图标。选中态与展开态口径一致——不加底板，
     只靠图标色阶（is-active → icon-1）区分；底色仅留给 hover。 */
  .is-collapsed & {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
  }
}

.page-frame__item-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--iflyv-icon-3);
  /* 选中态转 icon-1 时渐变过色，与导航项底板 hover 同档，不做突变 */
  transition: color var(--iflyv-duration-fast) var(--iflyv-ease-default);
}

/* 「更多」双态图标：两张叠放同一格，切换只改 opacity、不影响布局。
   尺寸/颜色都继承上面的 .page-frame__item-icon（20×20 + currentColor），这里不重复定义。
   切图画布本身就是 20×20（与 demo 的 nav-icons 同规格），svg 的 width/height:100%
   只是填满这一格，不涉及缩放。 */
.page-frame__more-icon {
  position: relative;
  display: block;
}

.page-frame__more-icon-img {
  position: absolute;
  inset: 0;
  display: block;
  opacity: 0;
  transition: opacity var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &.is-on { opacity: 1; }

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.page-frame__item-label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 可折叠父项箭头：展开时翻转 */
.page-frame__item-arrow {
  flex-shrink: 0;
  color: var(--iflyv-icon-3);
  transition: transform var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &.is-open {
    transform: rotate(180deg);
  }
}

/* 子菜单项：缩进对齐父项文字左缘（父项内边距 + 图标 18px + 图标间隙）；
   行高/字阶/色阶与一级项一致，仅靠缩进体现层级 */
.page-frame__subitem {
  display: flex;
  align-items: center;
  height: 44px;
  padding-inline-start: calc(var(--iflyv-spacing-3) + 18px + var(--iflyv-spacing-2));
  padding-inline-end: var(--iflyv-spacing-3);
  margin-bottom: var(--iflyv-spacing-0_5);
  border-radius: var(--iflyv-radius-sm);
  color: var(--iflyv-text-2);
  font: var(--iflyv-font-body-primary);
  cursor: pointer;
  /* 同 __group-title / __item-label：收起过渡中宽度仍在变（且本项缩进占掉 40px+），
     不锁 nowrap 会被挤成一列竖排字——始终横排、超出裁切 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    background var(--iflyv-duration-fast) var(--iflyv-ease-default),
    color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    background: var(--iflyv-border-subtle);
  }

  &.is-active {
    color: var(--iflyv-text-1);
    font-weight: var(--iflyv-font-weight-semibold);
  }
}

/* ==================== 主区 ==================== */
.page-frame__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 侧栏底部用户区：在滚动区之外，恒贴侧栏底缘。
   展开态横排；收起态（64px 只容一列 40px 方块）竖排成一列。
   自身不留上下内边距，只用 margin-bottom 与侧栏底缘隔开 spacing-3。
   ⚠️ 内容卡已改为四边无外边距、直接铺满主区，故此处不再与内容卡底缘对齐——
   这条留白只服务侧栏自身（避免用户区贴死窗口底缘）。

   ⚠️ 展开态用 grid 等分而非 flex + space-between：几个入口宽度并不一致
   （头像 36 含左右留白 / 图标按钮 28），space-between 是按内容宽排布，
   会让间隔看起来一大一小。一律等分、内容在各自等分宽度内居中，
   与 .metric-strip 是同一套口径（那里也踩过同一个坑）。
   列数用 auto-flow + auto-columns 自适应，业务方从两个插槽追加入口时
   自动多出一列、仍保持均匀，不必改任何样式。 */
.page-frame__userbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  /* 上下 spacing-4 内边距、贴侧栏底缘（侧栏自身 padding-bottom 为 0）——
     用内边距而非外边距：分隔线以上是导航、以下是用户区，
     这段留白属于用户区自己的上下呼吸，跟着线走才不会在两侧长短不一。 */
  padding-block: var(--iflyv-spacing-4);
  /* 左右内缩同其它子项（侧栏自身不给内边距，见 __sidebar 段注释），但必须走 margin 而非 padding：
     ⚠️ 分隔线是本元素的 border-top，border 在 **padding 之外**——内缩若给 padding，
     线仍会通栏铺到侧栏左右边缘（padding 只推内容、推不动线）。
     故用 margin-inline：线与内容一起内缩 16，与滚动区内容同一左右缘。 */
  margin-inline: var(--iflyv-spacing-4);
  border-top: 1px solid var(--iflyv-border-subtle);

  /* 收起态：64px 只容一列，改为竖排堆叠、取消左右分列。
     ⚠️ 用 column-reverse 而非 column：竖排后自上而下是「消息 → 帮助 → 头像」，
     身份区落在最底部——与展开态「头像在最左（起点）」是同一条规则的两个结果：
     用户区的起点恒在离内容区最远的那一端，收起后这一端从左变成了下。
     反转而非改 DOM 顺序：展开态的左右分列（头像左 / 功能图标右）要保持原样。 */
  .is-collapsed & {
    flex-direction: column-reverse;
    justify-content: center;
    gap: var(--iflyv-spacing-2);
    /* 收起态内缩 12（同其它子项收起态） */
    margin-inline: var(--iflyv-spacing-3);
  }
}

/* 右侧功能图标组（帮助 / 消息）：按钮组间距一律父容器 flex+gap
   （源头已清零 EP 相邻 margin，见 foundations 按钮间距段） */
.page-frame__userbar-actions {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);

  /* 收起态：跟着整排竖排，且同样反转——外层 column-reverse 只调换了
     「身份区」与「功能图标组」两大块的先后，组**内部**的帮助/消息若不跟着反转，
     整体顺序会变成「帮助 → 消息 → 头像」，与预期的「消息 → 帮助 → 头像」差一位。 */
  .is-collapsed & {
    flex-direction: column-reverse;
  }
}

/* 图标按钮（侧栏底部用户区）：28px 方形热区（结构尺寸，单点维护），小圆角 */
.page-frame__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--iflyv-radius-xs);
  background: transparent;
  color: var(--iflyv-icon-2);
  cursor: pointer;
  transition:
    background var(--iflyv-duration-fast) var(--iflyv-ease-default),
    color var(--iflyv-duration-fast) var(--iflyv-ease-default);

  &:hover {
    background: var(--iflyv-border-subtle);
    color: var(--iflyv-icon-1);
  }
}

.page-frame__avatar {
  display: flex;
  align-items: center;
  gap: var(--iflyv-spacing-2);
  cursor: pointer;
  min-width: 0;
}

/* 用户名：次要正文档（比导航项低一档）——用户区是常驻的身份标示、不是要读的内容，
   与导航项同档会来回争夺视线；色阶仍取 text-1（身份是确定的事实，不是可选项）。
   名字过长时省略，不把右侧图标组挤走。
   收起态 64px 放不下名字，隐藏（头像本身仍在）。 */
.page-frame__user-name {
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .is-collapsed & {
    display: none;
  }
}

/* 头像下拉外壳：EP 的 .el-dropdown 自带 margin-top: -1px（为对齐输入框基线而设），
   套在这排图标里会让头像比铃铛高 1px。此处只归零这条位移，
   不碰下拉面板与头像本身的任何外观。 */
.page-frame__avatar-menu {
  display: flex;
  margin-top: 0;
  /* 允许被右侧图标组挤压，长名字才能落到省略号（flex 子项默认 min-width:auto 不收缩） */
  min-width: 0;
}

/* 「更多」入口：EP 的 el-dropdown 外壳是 inline-block（按内容宽），
   套在导航里会比其它一级项窄一截。这里只把外壳撑满导航宽度，
   入口本体照常复用 .page-frame__item（高度/内边距/字阶/hover/选中态全在那条规则里，
   本处不重复定义，也不覆盖它的任何外观）。 */
.page-frame__more-entry {
  display: block;
  width: 100%;
  /* EP 给 .el-dropdown 加了 margin-top: -1px（为它自己的行内场景做基线微调），
     这里是块级导航项，那 1px 会让「更多」比上一项高 1px、对不齐 */
  margin-top: 0;
}

/* 内容区：白色内容大卡（直角，四边无外边距，直接铺满主区）。**只给外观与占位，不给版面**——
   内边距 / 滚动 / 分区 / 空态摆放全部交给业务层自己写（各页版面差异大，
   框架替业务定死只会处处被覆盖）。

   四条各自不可省：
     · background —— 卡片底色，框架的职责（无圆角、无外边距：内容区直接铺满主区）；
     · flex:1 + min-height:0     —— 在主区纵向 flex 里占满剩余高度。
       **这不是「版面」，是让卡片有确定高度的前提**：少了它卡片会塌成内容高度，
       业务层内部再写 height:100% / el-scrollbar / empty-page 居中就全都拿不到基准。
     · overflow: hidden —— **属于卡片外观，不是版面**：把内部滚动内容裁到卡片边界内，
       不产生滚动条。（内容卡现为直角无外边距、与主区边界重合，此条仍保留以裁切溢出。）
     · display: flex + column —— 让「不滚的页头」与「滚动区」上下分段，
       滚动区吃掉页头之外的剩余高度（见下方两条）。
   ⚠️ 有意不写 padding：留白归业务层（页头与内容各自给）。 */
.page-frame__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin: 0;
  background: var(--iflyv-bg-panel);
  overflow: hidden;
}

/* content-only：内容卡脱离框架单独使用，留白由承载方自己决定。
   ⚠️ 高度改回 100%：完整框架里靠 flex:1 在 .page-frame__main 的纵向 flex 里占满剩余高度；
   脱离框架后父级不再是那个 flex 容器，flex:1 拿不到基准、卡片会塌成内容高度，
   业务层内部的 el-scrollbar / empty-page 居中随之全部失效（同下方注释所述的前提）。 */
.page-frame__content.is-content-only {
  height: 100%;
}

/* 页头段（#page-header）：在滚动容器之外，故始终可见、不参与滚动。
   放页面级 tab 工具栏这类「页面定位信息」——它本就该常驻，
   放在滚动区里则要靠 sticky 吸顶，且会让滚动条轨道把这段也算进去。
   ⚠️ 不给内边距：留白归业务层（.toolbar 页面级档自带上下 16 / 左右 24）。 */
.page-frame__page-header {
  flex-shrink: 0;
  /* 吃掉页面级 .toolbar 的出血负外边距（左右各 -24）：
     那对负边距是给「工具栏在有内边距的页面容器里、吸顶时底色要铺满整宽」用的，
     这里页头本身就是整宽容器，不抵消的话工具栏会比页头宽 48、溢出被卡片圆角裁掉。
     用等量内边距抵消：视觉位置不变（左右仍 24），宽度回到与内容对齐。 */
  padding-inline: var(--iflyv-spacing-6);
}

/* 滚动区：吃掉页头之外的剩余高度，内容超出时在此滚动。
   min-height: 0 是 flex 子项允许收缩滚动的必要条件。 */
.page-frame__scroll-area {
  flex: 1;
  min-height: 0;
}

/* 具名滚动时间线：把「本区滚了多少」暴露给**滚动区之外**的页头，
   让页头里的工具栏能在内容一滚就显出分割线（纯 CSS，无需监听 scroll）。
   为什么需要具名：工具栏放进 #page-header 后已不在滚动容器内，
   `animation-timeline: scroll(nearest block)` 找不到滚动祖先、线永远不显形。
   ⚠️ 声明在真正滚动的元素（el-scrollbar 的 wrap）上，不是外壳。 */
.page-frame__scroll-area > :deep(.el-scrollbar__wrap) {
  scroll-timeline: --page-scroll block;
}

/* timeline-scope 必须挂在**同时包含「声明方」与「使用方」的共同祖先**上。
   声明方是滚动区里的 wrap、使用方是页头里的工具栏，二者是兄弟子树——
   挂在页头上只能让页头的后代看见，看不到兄弟子树里声明的名字（线永远不显形，实测踩过）。
   故挂在 .page-frame__content（页头与滚动区的共同父级）上。
   降级：不支持 scroll-timeline 的浏览器线始终不显示（不会出现「默认就有线」）。 */
@supports (animation-timeline: --x) {
  .page-frame__content {
    timeline-scope: --page-scroll;
  }
}
</style>
