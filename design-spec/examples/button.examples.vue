<!--
================================================================================
  Button 组件用法示例（design-spec 分发包配套）
================================================================================

  📖 如何使用本文件
  ──────────────────────────────────────────────────────────────────────
  本文件是 **参考代码片段**，不是可 import 的组件。使用方应：
  1. 复制对应 section 到自己的项目（按需取用，不需要全文导入）
  2. 配合 `references/component-interaction.md` 阅读完整规范
  3. 反模式（❌ 注释代码块）**仅作告诫，不要解开运行**

  🔗 与 demo/ 的关系
  ──────────────────────────────────────────────────────────────────────
  - `design-system/demo/src/components/ButtonDemo.vue` = **视觉展示**（设计师/产品看效果）
  - `design-spec/examples/button.examples.vue`（本文件）= **用法指南**（使用方/AI 学正确写法）
  两者职责不同：demo 演示组件能力的全谱，examples 教授规范化用法 + 反模式警示。

  📋 反模式总表
  ──────────────────────────────────────────────────────────────────────
  优先级说明：
    [BLOCKING]  绝对不可，违反会导致视觉/功能/规范严重出错
    [STRONG]    强烈建议，违反会引入 bug 或与设计系统冲突
    [SOFT]      风格偏好，违反不致命但偏离最佳实践

  | 优先级    | 反模式                                  | 后果                                     |
  |-----------|----------------------------------------|------------------------------------------|
  | BLOCKING  | type="success/warning/info"            | 项目禁用，回退 EP 原生色（与 brand 不符）|
  | STRONG    | 纯图标不加 .btn-icon-square            | 被 min-width: 80px 撑成 80×32 长方形    |
  | BLOCKING  | <el-button circle>                     | 圆形违反本设计系统规范                   |
  | STRONG    | 裸 <svg> 塞 default slot               | icon 与文字贴住（间距规则不触发）        |
  | STRONG    | 用 :icon 属性传 Lucide                 | 无法控制 size/stroke-width               |
  | STRONG    | 父容器 gap + button margin             | 间距叠加成双倍                           |
  | STRONG    | 使用方覆盖 .el-button + .el-button     | 同选择器加载晚，破坏全局清零             |
  | STRONG    | <el-button link> 与 <span> 混排        | vertical-align 锚点不一致，基线对不齐   |
  | SOFT      | loading 不加 aria-busy                 | 屏幕阅读器无法感知加载状态              |
  | SOFT      | 用 style="height: 40px" 调尺寸         | 应用 size="large"，避免硬编码           |

  完整规范见：design-spec/references/component-interaction.md
================================================================================
-->

<template>
  <div class="examples">

    <!-- ============================================================ -->
    <!-- 示例 1：基础类型（default / primary / danger）              -->
    <!-- ============================================================ -->
    <section>
      <h3>1. 基础类型</h3>

      <!-- ✅ 推荐：仅使用 default / primary / danger 三种 type -->
      <div class="row">
        <el-button>取消</el-button>
        <el-button type="primary">确认</el-button>
        <el-button type="danger">删除</el-button>
      </div>

      <!--
        @anti-pattern: 使用 success / warning / info type
        @priority: BLOCKING
        后果：foundations.md:18 明令禁用，scss 已删除对应样式（详见 git 历史 commit 033dbd4）。
              使用后会回退到 EP 原生色（与项目 brand 不匹配，视觉异常）。
        正确：用 default / primary / danger 表达主次；语义反馈用 Message / Notification。
      -->
      <!-- <el-button type="success">提交</el-button> -->
      <!-- <el-button type="warning">警告</el-button> -->
      <!-- <el-button type="info">信息</el-button> -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 2：图标 + 文字按钮                                      -->
    <!-- ============================================================ -->
    <section>
      <h3>2. 图标 + 文字</h3>

      <!-- ✅ 推荐：使用 #icon 插槽传 Lucide 图标，显式指定 size + stroke-width -->
      <div class="row">
        <el-button type="primary">
          <template #icon><Search :size="16" :stroke-width="2" /></template>
          搜索
        </el-button>
        <el-button>
          <template #icon><Pencil :size="16" :stroke-width="2" /></template>
          编辑
        </el-button>
      </div>

      <!--
        @anti-pattern #1: 把 <svg> / Lucide 组件直接塞 default slot
        @priority: STRONG
        后果：button.scss `.el-icon + span { margin-inline-start: 6px }` 不触发
              （裸 svg 不是 .el-icon），icon 和文字贴在一起。
        正确：用 <template #icon>，EP 自动用 .el-icon 容器包裹。
      -->
      <!--
        <el-button type="primary">
          <Search :size="16" :stroke-width="2" /> 搜索
        </el-button>
      -->

      <!--
        @anti-pattern #2: 用 :icon 属性传 Lucide 图标
        @priority: STRONG
        后果：属性方式只能传组件构造函数，无法控制 :size 和 :stroke-width，
              图标默认 24px + stroke-width 1.5（lucide-vue-next 默认值），与设计令牌不一致。
        正确：用 <template #icon> 插槽显式传参。
      -->
      <!-- <el-button type="primary" :icon="Search">搜索</el-button> -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 3：纯图标按钮                                           -->
    <!-- ============================================================ -->
    <section>
      <h3>3. 纯图标按钮</h3>

      <!-- ✅ 推荐：纯图标必须加 class="btn-icon-square"
           ⚠️ a11y：纯图标按钮必须加 aria-label 提供语义文本（屏幕阅读器依赖） -->
      <div class="row">
        <el-button type="primary" class="btn-icon-square" aria-label="编辑">
          <template #icon><Pencil :size="16" :stroke-width="2" /></template>
        </el-button>
        <el-button class="btn-icon-square" aria-label="分享">
          <template #icon><Share2 :size="16" :stroke-width="2" /></template>
        </el-button>
        <el-button type="danger" class="btn-icon-square" aria-label="删除">
          <template #icon><Trash2 :size="16" :stroke-width="2" /></template>
        </el-button>
      </div>

      <!--
        @anti-pattern #1: 纯图标按钮不加 .btn-icon-square
        @priority: STRONG
        后果：button.scss 中所有按钮（除豁免类型）强制 min-width: 80px，
              纯图标按钮会被撑成 80×32 长方形，视觉极度违和。
              这是分发场景下使用方最常见的踩坑点。
        正确：纯图标按钮一律加 class="btn-icon-square" 解除 80px 约束。
      -->
      <!--
        <el-button type="primary">
          <template #icon><Pencil :size="16" :stroke-width="2" /></template>
        </el-button>
      -->

      <!--
        @anti-pattern #2: 用 circle 属性
        @priority: BLOCKING
        后果：foundations.md:19 明令禁用，圆形违反本设计系统的方形按钮规范。
        正确：用 class="btn-icon-square"（方形 + radius-sm 圆角）。
      -->
      <!-- <el-button type="primary" :icon="Pencil" circle /> -->

      <!--
        @anti-pattern #3: 纯图标按钮不加 aria-label
        @priority: STRONG
        后果：屏幕阅读器只能读出"按钮"，无法告诉用户这个按钮是干什么的。
              视觉用户能看到 ✏️ 知道是编辑，盲人用户无法判断。
        正确：每个纯图标按钮必须加 aria-label="<具体动作>"。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 4：文字 / 链接按钮                                      -->
    <!-- ============================================================ -->
    <section>
      <h3>4. 文字 / 链接按钮</h3>

      <!-- ✅ 推荐：text 用于无边框次级操作；link 用于内联文字操作 -->
      <div class="row">
        <el-button text>取消</el-button>
        <el-button text type="primary">确认</el-button>
        <el-button link type="primary">查看详情</el-button>
        <el-button link type="danger">删除</el-button>
      </div>

      <!--
        @depends-on: el-button.is-link 继承 EP 基类 vertical-align: middle。
        @when-changed: 当 link 按钮与其他 inline 元素（el-dropdown / span 等）混排时，
                       兄弟元素必须也用 vertical-align: middle 才能基线对齐，
                       否则会出现一上一下的视觉错位（典型场景：表格操作列「编辑 | 查看 | 更多 ↓」
                       中的 dropdown 必须显式声明 vertical-align: middle，详见 table.scss）。

        @anti-pattern: <el-button link> 与 <span> 在同一行混排
        @priority: STRONG
        后果：el-button 默认 vertical-align: middle，span 默认 baseline，锚点不一致 → 错位。
        正确：要么全用 el-button，要么全用 span（保证锚点一致）。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 5：加载态 / 禁用态                                      -->
    <!-- ============================================================ -->
    <section>
      <h3>5. 加载态 / 禁用态</h3>

      <!-- ✅ 推荐：loading 配 aria-busy；disabled 状态对屏幕阅读器有原生支持 -->
      <div class="row">
        <el-button type="primary" loading aria-busy="true">提交中</el-button>
        <el-button type="danger" loading aria-busy="true">删除中</el-button>
        <el-button disabled>不可用</el-button>
        <el-button
          type="primary"
          class="btn-icon-square"
          loading
          aria-busy="true"
          aria-label="保存中"
        />
      </div>

      <!--
        @depends-on: loading 时图标会被替换为 spinner——使用方必须用 <template #icon>
                     插槽传图标（EP 会包 .el-icon）。裸 <svg> 不会触发图标替换。

        @anti-pattern: loading 不加 aria-busy="true"
        @priority: SOFT
        后果：屏幕阅读器用户听不到"正在加载"状态变化，会以为按钮卡住。
        正确：loading 时显式声明 aria-busy="true"，让 SR 读出 busy 状态。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 6：按钮组间距                                           -->
    <!-- ============================================================ -->
    <section>
      <h3>6. 按钮组间距</h3>

      <!-- ✅ 推荐：父容器 display: flex + gap 提供间距 -->
      <div class="row">
        <el-button>取消</el-button>
        <el-button type="primary">确认</el-button>
      </div>

      <!--
        @anti-pattern #1: 在使用方覆盖 .el-button + .el-button 间距规则
        @priority: STRONG
        后果：design-spec 已全局清零 EP 原生 margin-left: 12px（见 button.scss 的「相邻按钮间距清零」段）。
              如果使用方在 scoped 样式里再写：
                .el-button + .el-button { margin-inline-start: 12px }
              人话翻译：使用方写的 CSS 比 design-spec 后加载，会盖掉我们的清零设置，
              最终与父容器 gap 叠加成双倍间距。
        正确：只用父容器 flex+gap 提供间距，不要碰 .el-button + .el-button。
      -->

      <!--
        @anti-pattern #2: 在按钮上写 margin
        @priority: STRONG
        后果：违反「间距由父容器 gap 提供」统一约定，且 RTL 切换需手动改物理 margin。
        正确：使用方禁止在 button 上写 margin-left / margin-right /
              margin-inline-start / margin-inline-end。
      -->
      <!-- <el-button style="margin-left: 12px">确认</el-button> -->

      <!--
        @depends-on: 例外：.el-button-group 用 -1px 边框重叠效果。
        @when-changed: 不要给 el-button-group 包 flex+gap 父容器，否则破坏边框重叠视觉。
        ⚠️ a11y 限制：本设计系统的 el-button-group 仅是视觉聚合，
                       不提供 ARIA radio group / toolbar 行为，
                       不支持 ←/→ 键盘箭头切换焦点。
                       如需键盘导航请改用 ElRadioGroup 或自行 wire ARIA。
      -->
      <el-button-group>
        <el-button>左</el-button>
        <el-button>中</el-button>
        <el-button>右</el-button>
      </el-button-group>
    </section>

    <!-- ============================================================ -->
    <!-- 示例 7：尺寸变体                                             -->
    <!-- ============================================================ -->
    <section>
      <h3>7. 尺寸变体</h3>

      <!-- ✅ 推荐：使用 size 属性，自动适配 min-width（large 88 / default 80 / small 72） -->
      <div class="row" style="align-items: center;">
        <el-button size="large">Large</el-button>
        <el-button>Default</el-button>
        <el-button size="small">Small</el-button>
      </div>

      <!--
        @anti-pattern: 用 style="height: 40px" 或 style="font-size: 16px" 硬调尺寸
        @priority: SOFT
        后果：设计令牌（component-size / font-size）失效，多档主题切换（S/M/L/XL 字号档位）
              时按钮不会跟随响应式调整。
        正确：用 size="large" / "small" 属性；如需扩展尺寸档位，在 design-token 层添加。
      -->
    </section>

  </div>
</template>

<script setup lang="ts">
import { Search, Pencil, Share2, Trash2 } from 'lucide-vue-next'
</script>

<!--
  样式说明：
  本文件使用 design-token 中的 CSS 变量（var(--iflyv-spacing-*)）。
  分发场景下：使用方项目必须先 import design-token 才能正确显示。
  fallback：所有变量引用都带兜底值（如 var(--iflyv-spacing-3, 12px)），
           万一 token 未加载，仍能保持基本布局。
-->
<style scoped>
.examples > section {
  margin-bottom: var(--iflyv-spacing-6, 24px);
}
.examples h3 {
  margin-bottom: var(--iflyv-spacing-3, 12px);
  color: var(--iflyv-text-2, #4d5560);
  font-size: var(--iflyv-font-size-14, 14px);
  font-weight: 600;
}
.row {
  display: flex;
  gap: var(--iflyv-spacing-3, 12px);
}
</style>
