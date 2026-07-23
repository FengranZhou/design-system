<!--
================================================================================
  Dialog 组件用法示例（design-spec 分发包配套）
================================================================================

  📖 如何使用本文件
  ──────────────────────────────────────────────────────────────────────
  本文件是 **参考代码片段**，不是可 import 的组件。使用方应：
  1. 复制对应 section 到自己的项目（按需取用，不需要全文导入）
  2. 配合 `references/component-interaction.md` 阅读完整规范
  3. 反模式（❌ 注释代码块）**仅作告诫，不要解开运行**

  🔗 与 demo/ 的关系
  ──────────────────────────────────────────────────────────────────────
  - `design-system/demo/src/components/DialogDemo.vue` = **视觉展示**（设计师/产品看效果）
  - `design-spec/examples/dialog.examples.vue`（本文件）= **用法指南**（使用方/AI 学正确写法）

  📋 反模式总表
  ──────────────────────────────────────────────────────────────────────
  优先级说明：
    [BLOCKING]  绝对不可，违反会导致功能/视觉/规范严重出错
    [STRONG]    强烈建议，违反会引入 bug 或与设计系统冲突
    [SOFT]      风格偏好，违反不致命但偏离最佳实践

  | 优先级    | 反模式                                  | 后果                                     |
  |-----------|----------------------------------------|------------------------------------------|
  | BLOCKING  | width 不在三档（400/640/800）           | 违反 component-interaction.md 弹窗规范   |
  | BLOCKING  | 触发 dialog 没用 v-model                | 弹窗状态不可控（关闭后再次打开失效）     |
  | STRONG    | footer 按钮顺序：确认在左、取消在右      | 违反「确认按钮在右」设计系统约定         |
  | STRONG    | 内嵌 form 没 validate 直接关闭          | 表单数据无验证就关闭，无法保证有效性     |
  | STRONG    | 异步操作没 loading 状态                  | 用户重复点击 + 无反馈                    |
  | STRONG    | 危险操作主按钮没用 type="danger"         | 视觉无警示，用户误操作概率高             |
  | STRONG    | 危险操作不加 .is-danger 变体类           | 标题前无视觉警示，警示强度弱             |
  | STRONG    | 变体类与主按钮 type 语义不匹配           | is-warning 配 type="danger" 让用户困惑   |
  | STRONG    | 用 is-warning 做删除 / is-danger 做未保存提示 | 警示等级错位，认知失准              |
  | STRONG    | dialog 标题用通用文案"确认操作"          | 屏幕阅读器/视障用户无法判断具体操作      |
  | STRONG    | dialog 内表单 label-position 没用 "right" | 与设计系统约定不符（弹窗用 right 紧贴）  |
  | STRONG    | 在 footer .el-button 上写 margin        | 与 footer 自带 gap 叠加，间距双倍        |
  | SOFT      | 重要表单没 close-on-click-modal=false   | 用户误点遮罩丢失输入                     |
  | SOFT      | 多步骤 dialog 没设 destroy-on-close     | 切换后状态残留                           |
  | SOFT      | 普通成功提示用 is-success 弹窗           | 应该用 ElMessage.success，不需要弹窗     |

  完整规范见：design-spec/references/component-interaction.md「弹窗」章节
================================================================================
-->

<template>
  <div class="examples">

    <!-- ============================================================ -->
    <!-- 示例 1：宽度三档                                              -->
    <!-- ============================================================ -->
    <section>
      <h3>1. 宽度三档（400 / 640 / 800）</h3>

      <!--
        📐 宽度档位（spec：references/component-interaction.md:24）
          400px — 确认提示 / 单字段输入 / 简短信息（1~3 个表单项或纯文本）
          640px — 常规表单 / 详情预览（单列多字段）
          800px — 复杂表单 / 内嵌表格列表（双列表单 / 富内容）
        ⚠️ 不允许使用其他宽度（如 480 / 720）——破坏离散档位约定。
      -->

      <!-- ✅ 推荐：根据内容选档 -->
      <div style="display: flex; gap: 12px;">
        <el-button @click="visible400 = true">400 - 确认提示</el-button>
        <el-button @click="visible640 = true">640 - 常规表单</el-button>
        <el-button @click="visible800 = true">800 - 复杂表单</el-button>
      </div>

      <el-dialog v-model="visible400" title="确认操作" width="400px">
        <p>简短的确认信息，适合单字段或纯文本场景。</p>
        <template #footer>
          <el-button @click="visible400 = false">取消</el-button>
          <el-button type="primary" @click="visible400 = false">确认</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="visible640" title="编辑用户信息" width="640px">
        <el-form :model="form640" label-width="80px" label-position="right">
          <el-form-item label="姓名">
            <el-input v-model="form640.name" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form640.email" />
          </el-form-item>
          <el-form-item label="部门">
            <el-input v-model="form640.dept" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="visible640 = false">取消</el-button>
          <el-button type="primary" @click="visible640 = false">保存</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="visible800" title="批量配置权限" width="800px">
        <p style="color: var(--iflyv-text-3);">复杂场景：双列表单或内嵌表格选择器。</p>
        <template #footer>
          <el-button @click="visible800 = false">取消</el-button>
          <el-button type="primary" @click="visible800 = false">应用</el-button>
        </template>
      </el-dialog>

      <!--
        @anti-pattern: width="480px" 或其他非三档值
        @priority: BLOCKING
        后果：违反 component-interaction.md 弹窗宽度白名单——破坏离散档位约定。
        正确：从 400 / 640 / 800 三档中选；如确需中间档，先在 spec 表里补一档再用。
      -->
      <!-- <el-dialog width="480px"> -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 2：确认对话框（按钮顺序）                                -->
    <!-- ============================================================ -->
    <section>
      <h3>2. 确认对话框（按钮顺序）</h3>

      <!-- ✅ 推荐：取消在左、确认在右（DOM 顺序左→右，footer flex-end 整体右对齐） -->
      <el-button @click="visibleConfirm = true">打开确认对话框</el-button>

      <el-dialog v-model="visibleConfirm" title="保存修改" width="400px">
        <p>是否保存当前修改？未保存的内容将丢失。</p>
        <template #footer>
          <el-button @click="visibleConfirm = false">取消</el-button>
          <el-button type="primary" @click="visibleConfirm = false">保存</el-button>
        </template>
      </el-dialog>

      <!--
        @anti-pattern #1: footer 按钮顺序错（确认在左、取消在右）
        @priority: STRONG
        后果：违反「确认按钮在右」设计系统约定（component-interaction.md:24）。
              用户视觉肌肉记忆冲突——主操作按钮位置不一致，误点率上升。
        正确：DOM 顺序左→右：<取消> → <type="primary">确认</...>
      -->
      <!--
        <template #footer>
          <el-button type="primary">确认</el-button>  ← 主按钮放在左边
          <el-button>取消</el-button>
        </template>
      -->

      <!--
        @anti-pattern #2: 在 footer .el-button 上写 margin
        @priority: STRONG
        后果：dialog.scss 已为 footer 设了 `display: flex; gap: 12px` + 清零 button + button margin。
              使用方再加 margin 会与 gap 叠加成双倍间距。
        正确：不要碰 margin，gap 已自动提供 12px 间距。
      -->
      <!-- <el-button style="margin-right: 8px">取消</el-button> -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 3：危险操作确认                                          -->
    <!-- ============================================================ -->
    <section>
      <h3>3. 危险操作确认（删除）</h3>

      <!-- ✅ 推荐：标题语义化（说清楚要删什么）+ 主按钮 type="danger" -->
      <el-button type="danger" @click="visibleDanger = true">删除用户「张三」</el-button>

      <el-dialog v-model="visibleDanger" title="删除用户「张三」" width="400px">
        <p>此操作不可撤销，张三的所有数据将被永久删除。</p>
        <p style="color: var(--iflyv-text-3); font-size: 13px; margin-top: 8px;">
          关联的 12 条订单、5 条评论将一并清除。
        </p>
        <template #footer>
          <el-button @click="visibleDanger = false">取消</el-button>
          <el-button type="danger" @click="visibleDanger = false">确认删除</el-button>
        </template>
      </el-dialog>

      <!--
        @anti-pattern #1: 危险操作标题用通用文案"确认操作" / "提示"
        @priority: STRONG
        后果：屏幕阅读器/视障用户听到"确认操作"不知道要确认什么；
              视觉用户也容易在多个 dialog 中混淆。
        正确：标题里写清楚操作对象——「删除用户「张三」」「停用项目「DemoApp」」。
      -->
      <!-- <el-dialog title="确认操作"> -->

      <!--
        @anti-pattern #2: 危险操作主按钮没用 type="danger"
        @priority: STRONG
        后果：视觉上和"保存"等普通主按钮无差别，用户误点率上升。
        正确：危险操作主按钮一律用 type="danger"（红色警示）。
      -->
      <!-- <el-button type="primary" @click="confirmDelete">确认删除</el-button> -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 4：异步操作 + loading                                    -->
    <!-- ============================================================ -->
    <section>
      <h3>4. 异步操作 + loading</h3>

      <!-- ✅ 推荐：异步关闭操作期间，主按钮 loading；取消按钮 disabled 防中途取消 -->
      <el-button @click="visibleAsync = true">打开异步对话框</el-button>

      <el-dialog
        v-model="visibleAsync"
        title="提交申请"
        width="400px"
        :close-on-click-modal="!asyncSubmitting"
        :close-on-press-escape="!asyncSubmitting"
      >
        <p>点击"提交"后会调用后端接口（约 1 秒）。期间无法关闭弹窗。</p>
        <template #footer>
          <el-button :disabled="asyncSubmitting" @click="visibleAsync = false">取消</el-button>
          <el-button type="primary" :loading="asyncSubmitting" @click="handleAsyncSubmit">
            {{ asyncSubmitting ? '提交中' : '提交' }}
          </el-button>
        </template>
      </el-dialog>

      <!--
        @anti-pattern #1: 异步操作期间不锁定关闭路径
        @priority: STRONG
        后果：用户在提交中点击遮罩 / 按 Esc / 点取消都能关闭弹窗，
              但后端请求还在飞——可能造成数据不一致或重复提交。
        正确：提交期间动态关闭 close-on-click-modal / close-on-press-escape，
              并 disabled 取消按钮。
      -->

      <!--
        @anti-pattern #2: 异步操作没 loading 状态
        @priority: STRONG
        后果：用户瞬间不知道是否点中，可能重复点击；网络慢时体验更差。
        正确：主按钮绑定 :loading="submitting"，提交开始 true 结束 false。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 5：语义化标题（4 种变体）                                -->
    <!-- ============================================================ -->
    <section>
      <h3>5. 语义化标题（is-warning / is-danger / is-success / is-info）</h3>

      <!--
        🎨 4 个变体的语义与使用场景：
          is-warning → 警示但非危险（可逆操作）—— 橙色圆底 + 「!」
          is-danger  → 危险且不可逆 —— 红色圆底 + 「X」
          is-success → 操作完成结果反馈（复杂流程完结）—— 绿色圆底 + 「✓」
          is-info    → 中性信息提示（版本更新 / 功能说明）—— 蓝色圆底 + 「i」

        ⚠️ 主按钮 type 与变体类匹配：
          is-danger → type="danger"
          其他三种 → type="primary"
      -->

      <!-- ✅ 推荐：4 种变体的标准用法 -->
      <div style="display: flex; gap: 12px;">
        <el-button @click="visibleWarn = true">警告（warning）</el-button>
        <el-button type="danger" @click="visibleDel = true">危险（danger）</el-button>
        <el-button @click="visibleOk = true">完成（success）</el-button>
        <el-button @click="visibleInfo = true">信息（info）</el-button>
      </div>

      <el-dialog v-model="visibleWarn" class="is-warning" title="离开未保存页面" width="400px">
        <p>当前页有 3 处修改未保存。</p>
        <p style="margin-top: 8px; color: var(--iflyv-text-3); font-size: 13px;">
          离开后这些修改将丢失，建议先保存再离开。
        </p>
        <template #footer>
          <el-button @click="visibleWarn = false">取消</el-button>
          <el-button type="primary" @click="visibleWarn = false">保存并离开</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="visibleDel" class="is-danger" title="删除用户「张三」" width="400px">
        <p>此操作不可撤销，张三的所有数据将被永久删除。</p>
        <p style="margin-top: 8px; color: var(--iflyv-text-3); font-size: 13px;">
          关联的 12 条订单、5 条评论将一并清除。
        </p>
        <template #footer>
          <el-button @click="visibleDel = false">取消</el-button>
          <el-button type="danger" @click="visibleDel = false">确认删除</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="visibleOk" class="is-success" title="批量启用完成" width="400px">
        <p>已成功启用 32 个用户，3 个失败（权限不足）。</p>
        <template #footer>
          <el-button type="primary" @click="visibleOk = false">查看详情</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="visibleInfo" class="is-info" title="新版本可用" width="400px">
        <p>v0.5.0 已发布，包含若干 bug 修复和新功能。</p>
        <template #footer>
          <el-button @click="visibleInfo = false">稍后</el-button>
          <el-button type="primary" @click="visibleInfo = false">立即更新</el-button>
        </template>
      </el-dialog>

      <!--
        @anti-pattern #1: 危险操作不加 .is-danger 变体类
        @priority: STRONG
        后果：标题前无视觉警示，仅靠按钮颜色提醒，警示强度弱。
              用户可能错过"危险"信号导致误操作。
        正确：危险操作一律加 class="is-danger"。
      -->
      <!-- <el-dialog title="删除用户"><el-button type="danger">确认</el-button></el-dialog> -->

      <!--
        @anti-pattern #2: 变体类与主按钮 type 语义不匹配
        @priority: STRONG
        后果：例如 class="is-warning" 配 type="danger" 主按钮——
              标题色（橙）与按钮色（红）冲突，用户困惑是不是危险操作。
        正确：is-danger 配 type="danger"；is-warning / is-info / is-success 配 type="primary"。
      -->
      <!-- <el-dialog class="is-warning"><el-button type="danger">确认</el-button></el-dialog> -->

      <!--
        @anti-pattern #3: 警示等级错位
        @priority: STRONG
        后果：误把"未保存离开"用 is-danger / "删除"用 is-warning——
              用户对警示强度的认知失准。
        判断标准：
          is-warning = "你确定要这么做吗？做错了能反悔"
          is-danger  = "做了就回不去了"
        正确：删除 / 清除 / 永久禁用一律 is-danger；提醒 / 离开 / 配额预警一律 is-warning。
      -->

      <!--
        @anti-pattern #4: 普通成功提示用 is-success 弹窗
        @priority: SOFT
        后果：is-success 用于反馈"复杂流程完结"（如批量操作结果汇总），
              普通成功提示用弹窗反而打断用户操作。
        正确：普通"保存成功 / 提交成功"用 ElMessage.success()；
              复杂流程完结才用 is-success Dialog。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 6：嵌套表单 + validate                                   -->
    <!-- ============================================================ -->
    <section>
      <h3>6. 嵌套表单（validate 后再关闭）</h3>

      <!-- ✅ 推荐：dialog 内 form 加 ref，提交前调 validate；
           弹窗内表单约定用 label-position="right"（与 form.examples.vue 一致） -->
      <el-button @click="visibleForm = true">编辑信息</el-button>

      <el-dialog
        v-model="visibleForm"
        title="编辑用户信息"
        width="400px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="80px"
          label-position="right"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handleFormCancel">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit">保存</el-button>
        </template>
      </el-dialog>

      <!--
        @anti-pattern #1: 提交后没 validate 直接关闭
        @priority: STRONG
        后果：表单数据无验证就提交，可能存入无效数据。
        正确：handleSubmit 里先 await formRef.value?.validate() 再关闭。
      -->
      <!--
        function handleFormSubmit() {
          // 缺验证！直接关闭
          visibleForm.value = false
        }
      -->

      <!--
        @anti-pattern #2: 弹窗内表单 label-position 用 "top" 或 "left"
        @priority: STRONG
        后果：与设计系统约定不符——弹窗内表单约定 label-position="right"（label 文字右对齐紧贴 input）。
        正确：弹窗内表单用 right；整页/半页表单用 top；其他局部表单可用 left。
      -->

      <!--
        @anti-pattern #3: 嵌套表单的弹窗没设 close-on-click-modal=false
        @priority: SOFT
        后果：用户误点遮罩，输入到一半的表单数据丢失。
        正确：嵌套表单的弹窗一律 :close-on-click-modal="false"。
      -->
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const visible400 = ref(false)
const visible640 = ref(false)
const visible800 = ref(false)
const visibleConfirm = ref(false)
const visibleDanger = ref(false)
const visibleAsync = ref(false)
const visibleForm = ref(false)

// 语义化变体示例
const visibleWarn = ref(false)
const visibleDel = ref(false)
const visibleOk = ref(false)
const visibleInfo = ref(false)

const form640 = reactive({ name: '张三', email: 'zhangsan@iflyv.com', dept: '设计部' })

// 异步示例
const asyncSubmitting = ref(false)
async function handleAsyncSubmit() {
  asyncSubmitting.value = true
  await new Promise((r) => setTimeout(r, 1000))
  asyncSubmitting.value = false
  visibleAsync.value = false
  ElMessage.success('提交成功')
}

// 嵌套表单示例
const formRef = ref<FormInstance>()
const formData = reactive({ username: '', email: '' })
const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}
async function handleFormSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  visibleForm.value = false
  ElMessage.success('保存成功')
}
function handleFormCancel() {
  formRef.value?.resetFields()
  visibleForm.value = false
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
