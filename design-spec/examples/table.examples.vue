<!--
================================================================================
  Table 组件用法示例（design-spec 分发包配套）
================================================================================

  📖 如何使用本文件
  ──────────────────────────────────────────────────────────────────────
  本文件是 **参考代码片段**，不是可 import 的组件。使用方应：
  1. 复制对应 section 到自己的项目（按需取用，不需要全文导入）
  2. 配合 `references/component-interaction.md` 阅读完整规范
  3. 反模式（❌ 注释代码块）**仅作告诫，不要解开运行**

  🔗 与 demo/ 的关系
  ──────────────────────────────────────────────────────────────────────
  - `design-system/demo/src/components/TableDemo.vue` = **视觉展示**（设计师/产品看效果）
  - `design-spec/examples/table.examples.vue`（本文件）= **用法指南**（使用方/AI 学正确写法）

  📋 反模式总表
  ──────────────────────────────────────────────────────────────────────
  优先级说明：
    [BLOCKING]  绝对不可，违反会导致功能/视觉/规范严重出错
    [STRONG]    强烈建议，违反会引入 bug 或与设计系统冲突
    [SOFT]      风格偏好，违反不致命但偏离最佳实践

  | 优先级    | 反模式                                  | 后果                                     |
  |-----------|----------------------------------------|------------------------------------------|
  | BLOCKING  | 操作列用 <span class="table-operation"> | 失去键盘可达性 / a11y                    |
  | BLOCKING  | 使用 stripe 属性（斑马纹）              | 违反设计系统约定（用 hover 区分行）      |
  | STRONG    | 操作列用 <el-button link> 不加 .table-operation | 与下拉菜单 vertical-align 不一致 |
  | STRONG    | .table-operation 外包 flex+gap          | 与相邻选择器叠加，间距双倍               |
  | STRONG    | 操作列超过 3 个不用「更多」下拉          | 视觉拥挤，容易误点                       |
  | STRONG    | 「更多」下拉用 <span> 不用 <el-dropdown> | 失去原生 dropdown 行为 / 键盘支持        |
  | STRONG    | 排序触发用自定义事件不用 sortable 属性   | 重复造轮子，且失去 EP 内置交互           |
  | SOFT      | 表格行不加 v-loading                    | 数据加载时用户看到空白闪烁               |
  | SOFT      | 操作列没固定在右侧                       | 横向滚动时操作列被滚走，体验差           |
  | STRONG    | 所有列都用 width（无 min-width 列）      | 超宽屏右侧出现空白；列宽不会自适应       |
  | STRONG    | min-width 设在过短的列（如"姓名"）        | 短数据下该列被撑得空荡，视觉失衡         |

  完整规范见：design-spec/references/component-interaction.md「表格」相关章节
================================================================================
-->

<template>
  <div class="examples">

    <!-- ============================================================ -->
    <!-- 示例 1：基础表格 + 列宽决策原则                               -->
    <!-- ============================================================ -->
    <section>
      <h3>1. 基础表格（含列宽决策原则）</h3>

      <!--
        🎯 列宽决策原则（重要）：
        ──────────────────────────────────────────────────────────────────
        EP table 默认 width: 100%，列宽分配遵循下面规则：

        1. 「短/可预测内容列」用 width 固定：
           姓名(100) / 状态(100) / 金额(120) / 日期(150) / 操作(180-220, fixed)

        2. 选一列做 min-width 弹性，吃掉剩余宽度：
           ✓ 优先选「主信息列」——用户最常阅读的那一列。例如：
             - 用户列表 → 邮箱 / 账号
             - 订单列表 → 商品名 / 订单号
             - 设备列表 → 设备名 / 型号
             - 文章列表 → 标题
             - 申请列表 → 申请理由 / 备注
           ✗ 不要选过短的列（姓名/状态/金额）做 min-width，会被撑空荡

        3. 如果**所有列都很短没合适弹性候选**：
           方案 A：外层包 max-width 容器（如 max-width: 1280px），防止超宽屏空白
           方案 B：表格去掉 width: 100%，让它按列宽自然累加（auto）
           方案 C：让"主信息列"中长一些的字段做 min-width（即使数据短，规则上也合理）

        4. 至少要有一列是 min-width，否则超宽屏右侧会出现空白。
      -->

      <!-- ✅ 推荐：3 个固定 width 列 + 1 个 min-width 弹性列（邮箱作为主信息列） -->
      <el-table :data="basicData" style="width: 100%;">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.statusType">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!--
        @anti-pattern #1: 用 stripe 属性
        @priority: BLOCKING
        后果：违反设计系统约定（约定用 hover 行高亮区分行）。
        正确：不写 stripe，hover 自带行高亮（table.scss 的「行样式 Row」段已提供）。
      -->
      <!-- <el-table :data="data" stripe>...</el-table> -->

      <!--
        @anti-pattern #2: 所有列都用 width（无 min-width 列）
        @priority: STRONG
        后果：超宽屏（>所有列 width 总和）右侧出现大片空白，体验割裂。
        正确：至少一列用 min-width，让它吸收剩余宽度。
      -->

      <!--
        @anti-pattern #3: min-width 设在过短的列（如姓名 / 状态）
        @priority: STRONG
        后果：短数据下该列被撑得空荡（"设计部"占 30px、列宽 800px）。
        正确：min-width 留给真正需要更多空间的长内容列（备注 / 描述 / 标题）。
      -->
      <!-- <el-table-column prop="name" label="姓名" min-width="200" />  ← min-width 设错地方 -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 2：排序                                                  -->
    <!-- ============================================================ -->
    <section>
      <h3>2. 排序</h3>

      <!-- ✅ 推荐：用 sortable 属性，EP 自带交互 + 我们的 SVG 箭头视觉 -->
      <el-table :data="basicData" style="width: 100%;">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" width="120" sortable />
        <el-table-column prop="amount" label="金额" width="120" sortable />
      </el-table>

      <!--
        @anti-pattern: 排序触发用自定义事件 / 自己造箭头
        @priority: STRONG
        后果：重复造轮子；失去 EP 内置的 sort-change 事件、多列排序、默认排序等能力；
              箭头视觉与设计系统不统一（table.scss 用 SVG mask 提供 Lucide 风格箭头）。
        正确：用 sortable 属性（true / 'custom'），监听 @sort-change 处理后端排序。
      -->
      <!--
        <el-table-column prop="amount" label="金额">
          <template #header>
            金额 <span @click="customSort">↑↓</span>  ← 自己造排序
          </template>
        </el-table-column>
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 3：操作列（标准用法）                                    -->
    <!-- ============================================================ -->
    <section>
      <h3>3. 操作列（≤3 个操作）</h3>

      <!-- ✅ 推荐：操作列固定在最右侧；用 <el-button class="table-operation" link>
           保留按钮 a11y，table-operation 类提供裸文字外观 + spacing-3 间距 -->
      <el-table :data="basicData" style="width: 100%;">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button class="table-operation" link>编辑</el-button>
            <el-button class="table-operation" link>查看</el-button>
            <el-button class="table-operation table-operation--danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--
        @anti-pattern #1: 操作列用 <span class="table-operation">
        @priority: BLOCKING
        后果：失去按钮的键盘可达性、Tab 顺序、屏幕阅读器语义——盲人用户无法操作。
        正确：用 <el-button class="table-operation" link>，视觉与 span 一致但语义正确。
      -->
      <!-- <span class="table-operation">编辑</span> -->

      <!--
        @anti-pattern #2: 用 <el-button link> 但不加 .table-operation 类
        @priority: STRONG
        后果：el-button link 默认带 padding，操作列视觉显得"有按钮感"，破坏裸文字风格；
              与「更多」下拉的 vertical-align 也对不齐（dropdown 配 .table-operation 才显式 middle）。
        正确：始终加 class="table-operation"。
      -->
      <!-- <el-button link>编辑</el-button> -->

      <!--
        @anti-pattern #3: 给 .table-operation 包 flex+gap 父容器
        @priority: STRONG
        后果：与 table.scss 的 `.table-operation + .table-operation { margin-inline-start: 12px }`
              叠加，间距变成 24px。
        正确：直接在 td 内并排写多个 .table-operation，间距由相邻选择器自动提供。
      -->
      <!--
        <div style="display: flex; gap: 12px;">
          <el-button class="table-operation" link>编辑</el-button>
          <el-button class="table-operation" link>删除</el-button>
        </div>
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 4：操作列含「更多」下拉（>3 个操作）                     -->
    <!-- ============================================================ -->
    <section>
      <h3>4. 操作列（>3 个操作，用「更多」下拉）</h3>

      <!-- ✅ 推荐：超过 3 个操作时收纳到「更多」下拉，避免视觉拥挤 -->
      <el-table :data="basicData" style="width: 100%;">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default>
            <el-button class="table-operation" link>编辑</el-button>
            <el-button class="table-operation" link>查看</el-button>
            <el-dropdown class="table-operation">
              <span class="table-operation__more">更多 <ChevronDown :size="14" :stroke-width="2" /></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>发布</el-dropdown-item>
                  <el-dropdown-item>下载</el-dropdown-item>
                  <el-dropdown-item divided>
                    <span style="color: var(--iflyv-danger-primary)">删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!--
        @depends-on: <el-dropdown class="table-operation"> 的 vertical-align: middle
                     由 table.scss 的「.el-dropdown.table-operation」段显式声明，配合兄弟 el-button link（默认 middle）对齐。
                     若把兄弟改回 <span class="table-operation">（默认 baseline），
                     必须同步把 dropdown 的 vertical-align 改回 baseline，否则错位。
        @see: 方法论案例：design-system分发-隐式耦合.md 类型 1 案例 A。

        @anti-pattern: 「更多」下拉用 <span> 不用 <el-dropdown>
        @priority: STRONG
        后果：失去原生 dropdown 的键盘 ↑↓ 切换、Esc 关闭、focus trap 等行为。
        正确：用 <el-dropdown>，配合 .table-operation 类保持外观统一。
      -->

      <!--
        @anti-pattern: 5 个操作并排不用「更多」下拉
        @priority: STRONG
        后果：操作列宽度爆炸，挤压数据列；用户视觉负担高。
        正确：保留前 2-3 个高频操作，其余收进「更多」下拉。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 5：选择行（多选）                                        -->
    <!-- ============================================================ -->
    <section>
      <h3>5. 多选 + 批量操作</h3>

      <!-- ✅ 推荐：第一列加 type="selection"；批量操作放在表格上方工具栏 -->
      <div style="margin-bottom: 12px; display: flex; gap: 12px; align-items: center;">
        <span style="color: var(--iflyv-text-3); font-size: 13px;">
          已选 {{ selected.length }} 项
        </span>
        <el-button type="primary" :disabled="!selected.length">批量启用</el-button>
        <el-button :disabled="!selected.length">批量导出</el-button>
      </div>
      <el-table :data="basicData" @selection-change="(s) => selected = s" style="width: 100%;">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="amount" label="金额" width="120" />
      </el-table>
    </section>

    <!-- ============================================================ -->
    <!-- 示例 6：固定列（横向滚动）                                    -->
    <!-- ============================================================ -->
    <section>
      <h3>6. 固定列</h3>

      <!-- ✅ 推荐：列多到一屏放不下时，操作列固定在右侧；
           **关键**：固定列模式下，必须留至少一列用 min-width（这里是「备注」），
           否则超宽屏所有 width 列加起来不足容器宽度，右侧出现大片空白。
           ⚠️ RTL 提示：阿语等 RTL 模式下，表格固定列功能会被 table.scss 降级（自动取消 sticky） -->
      <el-table :data="basicData" style="width: 100%;">
        <el-table-column prop="name" label="姓名" width="100" fixed="left" />
        <el-table-column prop="email" label="邮箱" min-width="220" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.statusType">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" />
        <el-table-column prop="position" label="职位" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button class="table-operation" link>编辑</el-button>
            <el-button class="table-operation table-operation--danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--
        @anti-pattern #1: 列多到横向滚动但操作列不固定在右侧
        @priority: SOFT
        后果：用户横向滚动看其他列时，操作按钮被滚出视野，需要滚回去才能操作。
        正确：操作列加 fixed="right"。
      -->

      <!--
        @anti-pattern #2: 固定列示例所有列都用 width 固定（没有 min-width 弹性列）
        @priority: STRONG
        后果：所有 width 加起来比容器小时（超宽屏常见），右侧出现大片空白；
              所有 width 加起来比容器大时，横向滚动正常但显得僵硬。
        正确：留至少一列用 min-width 吸收剩余宽度（推荐"备注/描述"等长内容列）。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 7：加载态                                                -->
    <!-- ============================================================ -->
    <section>
      <h3>7. 加载态</h3>

      <!-- ✅ 推荐：v-loading 指令包裹，加载时遮罩 + spinner -->
      <el-button @click="toggleLoading">{{ loading ? '停止加载' : '开始加载' }}</el-button>
      <el-table v-loading="loading" :data="basicData" style="width: 100%; margin-top: 12px;">
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="amount" label="金额" width="120" />
      </el-table>

      <!--
        @anti-pattern: 异步数据加载时表格不加 v-loading
        @priority: SOFT
        后果：用户看到空白表格闪烁；不知道是无数据还是正在加载。
        正确：用 v-loading 指令；如果区分"加载"和"无数据"，配合 element-plus-empty slot。
      -->
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const basicData = ref([
  { name: '张三', email: 'zhangsan@iflyv.com', status: '启用', statusType: 'success', department: '设计部', amount: 12000, position: '高级设计师' },
  { name: '李四', email: 'lisi@iflyv.com', status: '禁用', statusType: 'info', department: '研发部', amount: 18000, position: '资深前端' },
  { name: '王五', email: 'wangwu@iflyv.com', status: '启用', statusType: 'success', department: '产品部', amount: 15000, position: '产品经理' },
])

const selected = ref<unknown[]>([])
const loading = ref(false)
function toggleLoading() {
  loading.value = !loading.value
}
</script>

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
</style>
