<!--
================================================================================
  Select 组件用法示例（design-spec 分发包配套）
================================================================================

  📖 如何使用本文件
  ──────────────────────────────────────────────────────────────────────
  本文件是 **参考代码片段**，不是可 import 的组件。使用方应：
  1. 复制对应 section 到自己的项目（按需取用，不需要全文导入）
  2. 配合 `references/component-interaction.md` 阅读完整规范
  3. 反模式（❌ 注释代码块）**仅作告诫，不要解开运行**

  🔗 与 demo/ 的关系
  ──────────────────────────────────────────────────────────────────────
  - `design-system/demo/src/components/SelectDemo.vue` = **视觉展示**（设计师/产品看效果）
  - `design-spec/examples/select.examples.vue`（本文件）= **用法指南**（使用方/AI 学正确写法）

  📋 反模式总表
  ──────────────────────────────────────────────────────────────────────
  优先级说明：
    [BLOCKING]  绝对不可，违反会导致功能/视觉/规范严重出错
    [STRONG]    强烈建议，违反会引入 bug 或与设计系统冲突
    [SOFT]      风格偏好，违反不致命但偏离最佳实践

  | 优先级    | 反模式                                              | 后果                                  |
  |-----------|----------------------------------------------------|---------------------------------------|
  | BLOCKING  | 没用 v-model                                       | 数据双向绑定断裂，选中无法获取        |
  | BLOCKING  | 多选未配置「collapse-tags 三件套」                  | 10+ 选中后 tag 撑爆 input 高度        |
  | STRONG    | 选项 value 不唯一                                  | Vue key 冲突，渲染错乱                |
  | STRONG    | 远程搜索没节流 + 没 loading 状态                    | 高频请求 + 用户不知道在加载            |
  | STRONG    | 大数据量（>200 项）不分组 / 不用虚拟滚动           | 渲染卡顿 / 用户找不到目标项            |
  | SOFT      | 用 style="width: 80px" 改尺寸                      | 应用 size 属性，避免硬编码             |
  | STRONG    | filterable 关键词搜索字段不明确                     | 默认只搜 label，搜不到 value 编码      |
  | SOFT      | 没 placeholder 友好提示                             | 用户看到空白下拉不知道选什么          |
  | SOFT      | 必填字段没在 form-item 加 prop + rules              | 校验失效（form 章节同口径）           |

  完整规范见：design-spec/references/component-interaction.md「Select 多选」章节
================================================================================
-->

<template>
  <div class="examples">

    <!-- ============================================================ -->
    <!-- 示例 1：基础单选                                              -->
    <!-- ============================================================ -->
    <section>
      <h3>1. 基础单选</h3>

      <!-- ✅ 推荐：v-model 绑定值 + placeholder 提示 + 选项 v-for -->
      <el-select v-model="form1.dept" placeholder="请选择部门" style="width: 240px;">
        <el-option v-for="d in deptOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>

      <!--
        @anti-pattern: 没用 v-model
        @priority: BLOCKING
        后果：数据双向绑定断裂，选中后无法获取选中值，表单提交时拿不到数据。
        正确：始终 v-model="someRef" 绑定。
      -->
      <!-- <el-select placeholder="..."> 不带 v-model -->

      <!--
        @anti-pattern: 选项 value 不唯一
        @priority: STRONG
        后果：Vue 同 key 冲突，下拉项渲染错乱（重复项消失或闪烁）；
              选中状态映射出错。
        正确：value 字段必须唯一（用 id 或后端唯一 key）。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 2：多选（collapse-tags 三件套）                          -->
    <!-- ============================================================ -->
    <section>
      <h3>2. 多选（必须配 collapse-tags 三件套）</h3>

      <!-- ✅ 推荐：multiple + collapse-tags + collapse-tags-tooltip + :max-collapse-tags="2"
           三个属性必须同时使用——单独用 collapse-tags 折叠后用户看不到全部，
           tooltip 让 hover 展示全部，max-collapse-tags 控制折叠门槛 -->
      <el-select
        v-model="form2.depts"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="2"
        placeholder="请选择部门（多选）"
        style="width: 360px;"
      >
        <el-option v-for="d in deptOptions" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>

      <!--
        @anti-pattern #1: 多选未配置「collapse-tags 三件套」
        @priority: BLOCKING
        后果：选中 10+ 项后，所有 tag 同时显示，input 高度被撑爆，
              邻接元素被挤压，整个表单/筛选栏布局崩坏。
        正确：本设计系统约定多选**一律**配三件套：
              collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
        见：references/component-interaction.md「Select 多选」。
      -->
      <!-- <el-select v-model="x" multiple>...</el-select>  ← 缺三件套 -->

      <!--
        @anti-pattern #2: 只用 collapse-tags 不带 tooltip
        @priority: STRONG
        后果：折叠后用户只能看到「设计部、研发部 +3」中的"+3"数字，
              不知道这 3 项具体是什么——必须重新打开下拉菜单才能查看选中。
        正确：必须配 collapse-tags-tooltip，hover 触发悬浮气泡展示全部。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 3：可清除 / 可搜索                                       -->
    <!-- ============================================================ -->
    <section>
      <h3>3. 可清除 / 可搜索</h3>

      <!-- ✅ 推荐：clearable 让用户能清空；filterable 让用户能搜索 -->
      <div style="display: flex; gap: 12px;">
        <el-select v-model="form3.a" clearable placeholder="可清除" style="width: 240px;">
          <el-option v-for="d in deptOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
        <el-select v-model="form3.b" filterable placeholder="可搜索（关键词匹配 label）" style="width: 280px;">
          <el-option v-for="d in deptOptions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </div>

      <!--
        @anti-pattern: filterable 默认只搜 label，关键词期望搜 value 时未配 filter-method
        @priority: STRONG
        后果：用户输入 value 编码（如部门 ID）时搜不到——默认 filter 仅匹配 label 文本。
        正确：如果业务需要搜 value，自定义 filter-method:
              :filter-method="(query) => options.filter(o => o.label.includes(query) || o.value.includes(query))"
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 4：远程搜索（异步 + loading + 节流）                     -->
    <!-- ============================================================ -->
    <section>
      <h3>4. 远程搜索</h3>

      <!-- ✅ 推荐：filterable + remote + remote-method + :loading
           remote-method 必须节流（避免高频 API 调用） -->
      <el-select
        v-model="form4.user"
        filterable
        remote
        :remote-method="handleRemoteSearch"
        :loading="remoteLoading"
        placeholder="输入关键词搜索用户"
        style="width: 280px;"
      >
        <el-option v-for="u in remoteResults" :key="u.value" :label="u.label" :value="u.value" />
      </el-select>

      <!--
        @anti-pattern #1: remote-method 没节流
        @priority: STRONG
        后果：用户每输入一个字就触发一次 API 请求——高频请求耗服务器、可能触发限流，
              且后到达的请求结果可能覆盖最新查询的结果（race condition）。
        正确：用 lodash debounce 或自实现节流（300-500ms），同时取消上一次请求。
      -->

      <!--
        @anti-pattern #2: 没 :loading 状态
        @priority: STRONG
        后果：用户输入后看到下拉为空，不知道是"没结果"还是"正在加载"。
        正确：必须绑定 :loading，下拉菜单会显示 spinner。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 5：选项分组                                              -->
    <!-- ============================================================ -->
    <section>
      <h3>5. 选项分组（option-group）</h3>

      <!-- ✅ 推荐：选项数量较多（通常 >10）或有自然分类时使用 group -->
      <el-select v-model="form5.role" placeholder="请选择岗位" style="width: 240px;">
        <el-option-group v-for="g in roleGroups" :key="g.label" :label="g.label">
          <el-option v-for="r in g.options" :key="r.value" :label="r.label" :value="r.value" />
        </el-option-group>
      </el-select>

      <!--
        @anti-pattern: 大数据量（>200 项）不分组 / 不用虚拟滚动
        @priority: STRONG
        后果：渲染 200+ DOM 节点首次打开下拉时卡顿；
              用户在长列表里找目标项困难。
        正确：≤10 项不需要分组；10-200 项视语义分组；>200 项用 ElSelectV2（虚拟滚动）。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 6：级联选择（Cascader）                                  -->
    <!-- ============================================================ -->
    <section>
      <h3>6. 级联选择 Cascader</h3>

      <!-- ✅ 推荐：用于有明确父子层级的数据（地区/分类/部门树） -->
      <el-cascader
        v-model="form6.tech"
        :options="techOptions"
        placeholder="请选择技术栈"
        style="width: 300px;"
      />

      <!--
        @depends-on: cascader 箭头由 select.scss 通过 mask 替换为 Lucide ChevronDown，
                     与 select 视觉统一（升级 EP 大版本时若 .icon-arrow-down 命名变化需调整）。

        @anti-pattern: 把扁平数据强行组成 Cascader（业务上没有明确父子关系）
        @priority: STRONG
        后果：用户被多余的层级困扰，选择路径不必要地长。
        正确：只在确有层级关系（地区/部门组织树/品类目录）时用 Cascader；
              扁平选项用普通 Select。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 7：尺寸变体                                              -->
    <!-- ============================================================ -->
    <section>
      <h3>7. 尺寸变体</h3>

      <!-- ✅ 推荐：用 size 属性切换（large / default / small） -->
      <div style="display: flex; gap: 12px; align-items: center;">
        <el-select size="large" placeholder="Large" style="width: 200px;">
          <el-option label="选项一" value="1" />
        </el-select>
        <el-select placeholder="Default" style="width: 200px;">
          <el-option label="选项一" value="1" />
        </el-select>
        <el-select size="small" placeholder="Small" style="width: 200px;">
          <el-option label="选项一" value="1" />
        </el-select>
      </div>

      <!--
        @anti-pattern: 用 style="height: 40px" 硬调尺寸
        @priority: STRONG
        后果：设计 token 失效，多档字号切换（S/M/L/XL）时不响应式。
        正确：用 size 属性。
      -->
    </section>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const deptOptions = [
  { value: '1', label: '设计部' },
  { value: '2', label: '研发部' },
  { value: '3', label: '产品部' },
  { value: '4', label: '市场部' },
  { value: '5', label: '运营部' },
  { value: '6', label: '财务部' },
  { value: '7', label: '人事部' },
  { value: '8', label: '客服部' },
]

const roleGroups = [
  { label: '技术岗', options: [{ value: 'fe', label: '前端' }, { value: 'be', label: '后端' }, { value: 'qa', label: '测试' }] },
  { label: '业务岗', options: [{ value: 'pd', label: '产品' }, { value: 'op', label: '运营' }, { value: 'mk', label: '市场' }] },
]

const techOptions = [
  { value: 'frontend', label: '前端', children: [
    { value: 'vue', label: 'Vue' },
    { value: 'react', label: 'React' },
  ]},
  { value: 'backend', label: '后端', children: [
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
  ]},
]

const form1 = reactive({ dept: '' })
const form2 = reactive<{ depts: string[] }>({ depts: [] })
const form3 = reactive({ a: '', b: '' })
const form5 = reactive({ role: '' })
const form6 = reactive<{ tech: string[] }>({ tech: [] })
const form4 = reactive({ user: '' })

// 远程搜索示例（节流 + loading 模拟）
const remoteLoading = ref(false)
const remoteResults = ref<{ value: string; label: string }[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

function handleRemoteSearch(query: string) {
  if (searchTimer) clearTimeout(searchTimer)
  if (!query) {
    remoteResults.value = []
    return
  }
  remoteLoading.value = true
  // 节流 + 模拟异步
  searchTimer = setTimeout(() => {
    remoteResults.value = ['张三', '李四', '王五', '赵六', '钱七']
      .filter((n) => n.includes(query))
      .map((n) => ({ value: n, label: `${n}（用户）` }))
    remoteLoading.value = false
  }, 400)
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
