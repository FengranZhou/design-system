<!--
================================================================================
  Form 组件用法示例（design-spec 分发包配套）
================================================================================

  📖 如何使用本文件
  ──────────────────────────────────────────────────────────────────────
  本文件是 **参考代码片段**，不是可 import 的组件。使用方应：
  1. 复制对应 section 到自己的项目（按需取用，不需要全文导入）
  2. 配合 `references/component-interaction.md` 阅读完整规范
  3. 反模式（❌ 注释代码块）**仅作告诫，不要解开运行**

  🔗 与 demo/ 的关系
  ──────────────────────────────────────────────────────────────────────
  - `design-system/demo/src/components/FormDemo.vue` = **视觉展示**（设计师/产品看效果）
  - `design-spec/examples/form.examples.vue`（本文件）= **用法指南**（使用方/AI 学正确写法）

  📋 反模式总表
  ──────────────────────────────────────────────────────────────────────
  优先级说明：
    [BLOCKING]  绝对不可，违反会导致功能/视觉/规范严重出错
    [STRONG]    强烈建议，违反会引入 bug 或与设计系统冲突
    [SOFT]      风格偏好，违反不致命但偏离最佳实践

  | 优先级    | 反模式                                  | 后果                                     |
  |-----------|----------------------------------------|------------------------------------------|
  | BLOCKING  | <el-form-item> 不写 prop="<key>"       | 校验完全失效（rules 无法关联到字段）     |
  | BLOCKING  | <el-form> 不写 :model                  | 数据双向绑定断裂，validate() 拿不到值    |
  | BLOCKING  | input 不用 v-model                     | 受控组件变非受控，表单数据无法收集       |
  | STRONG    | 提交按钮放在 form-item 外              | 失去 form-item__content 内置 12px gap   |
  | STRONG    | 用 style="width: 80px" 改 label 宽度   | 应用 label-width 属性，避免硬编码        |
  | STRONG    | 用 label-position="top" 顶部标签       | 全站只用「标签在左」，top 暂停启用       |
  | STRONG    | 多行文本用 el-input 不带 type="textarea" | 只能输入单行，体验破坏                  |
  | SOFT      | rules 不带 trigger                     | 默认 change，输入即校验，体验差          |
  | SOFT      | form 不加 ref                          | 无法编程式 validate / resetFields        |
  | SOFT      | 表单按钮没 loading 反馈                | 提交瞬间用户不知道是否点中               |

  完整规范见：design-spec/references/patterns/form-pattern.md（表单布局模式，以此为准）
================================================================================
-->

<template>
  <div class="examples">

    <!-- ============================================================ -->
    <!-- 示例 1：标签布局（全站唯一一种：标签在左）                      -->
    <!-- ============================================================ -->
    <section>
      <h3>1. 标签布局</h3>

      <!-- ✅ 推荐：标签在左 + label-width="auto"
           auto 自动取本表单最长 label 的实际宽度作统一列宽：短 label 右对齐后
           输入框左缘对齐成一条线，且零富余（不像手写固定 px 那样留多余空白）。
           注：EP 的 label-position="right" 指「标签文字右对齐」，标签仍在控件左侧。 -->
      <div class="row">
        <el-form :model="form2" label-width="auto" label-position="right" style="width: 280px;">
          <el-form-item label="用户名">
            <el-input v-model="form2.username" placeholder="标签在左" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form2.email" placeholder="" />
          </el-form-item>
        </el-form>
      </div>

      <!--
        @anti-pattern: 用 label-position="top" 做顶部标签表单
        @priority: STRONG
        后果：与全站表单布局不一致，用户切换页面时视觉跳跃。
        正确：全站只用「标签在左」这一种布局，top 暂停启用
              （源头 form.scss 亦已注明暂停）。完整规则见
              references/patterns/form-pattern.md。
      -->

      <!--
        @anti-pattern: 手写固定 label-width="80px"
        @priority: SOFT
        后果：label 列宽与实际最长标签不匹配，留多余空白或挤压。
        正确：用 label-width="auto"，除非有特殊对齐需求。
      -->

      <!--
        @anti-pattern: 用 style="width: 80px" 改 label 宽度
        @priority: STRONG
        后果：label 与 input 对齐失效；多档字号切换时不响应式。
        正确：用 label-width="80px" 属性。
      -->
      <!-- <el-form-item label="用户名" style="width: 80px"> -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 2：必填校验 + 编程式提交                                  -->
    <!-- ============================================================ -->
    <section>
      <h3>2. 必填校验 + 编程式提交</h3>

      <!-- ✅ 推荐：完整闭环（model + rules + prop + ref + validate） -->
      <el-form
        ref="formRef"
        :model="form3"
        :rules="rules3"
        label-width="80px"
        style="width: 360px;"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form3.username" placeholder="必填" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form3.email" placeholder="必填且需为合法邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!--
        @anti-pattern #1: <el-form-item> 不写 prop="<key>"
        @priority: BLOCKING
        后果：校验完全失效——rules 无法关联到字段，validate() 永远返回 true。
        正确：每个需要校验的 form-item 必须写 prop="<对应 model 的 key>"。
      -->
      <!--
        <el-form :model="form" :rules="rules">
          <el-form-item label="用户名">  ← 没写 prop！
            <el-input v-model="form.username" />
          </el-form-item>
        </el-form>
      -->

      <!--
        @anti-pattern #2: <el-form> 不写 :model
        @priority: BLOCKING
        后果：数据双向绑定断裂，validate() 拿不到值，rules 无效。
        正确：<el-form :model="form" ref="formRef" :rules="rules">。
      -->

      <!--
        @anti-pattern #3: input 不用 v-model
        @priority: BLOCKING
        后果：受控组件变非受控，表单数据无法收集——提交时 form 对象的字段都是空。
        正确：<el-input v-model="form.username" />。
      -->

      <!--
        @anti-pattern #4: rules 不带 trigger
        @priority: SOFT
        后果：默认 change 触发——输入每个字符都校验，性能差且体验差（红字闪烁）。
        正确：blur 触发（失焦才校验）；select / radio 等用 change（选中即校验）。
      -->
      <!-- { required: true, message: '请输入用户名' }  ← 没 trigger -->

      <!--
        @anti-pattern #5: form 不加 ref
        @priority: SOFT
        后果：无法编程式调用 validate() / resetFields() / clearValidate()，
              重置表单只能手动一个个清字段，提交校验也得 watch model 实现。
        正确：<el-form ref="formRef">，配合 const formRef = ref<FormInstance>()。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 3：表单按钮（在 form-item 内，自带 12px 间距）            -->
    <!-- ============================================================ -->
    <section>
      <h3>3. 表单按钮</h3>

      <!-- ✅ 推荐：把按钮放在 form-item 内——
           form-item__content 自带 gap: 12px（form.scss 的「form-item__content 自带 12px gap」段提供），无需额外 flex+gap -->
      <el-form :model="form4" label-width="80px" style="width: 320px;">
        <el-form-item label="备注">
          <el-input v-model="form4.remark" type="textarea" :rows="3" placeholder="可多行输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">提交</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>

      <!--
        @anti-pattern #1: 提交按钮放在 form-item 外
        @priority: STRONG
        后果：失去 form-item__content 的内置 12px gap，按钮间距挤在一起或需要使用方再写 flex+gap。
        正确：把按钮放在 <el-form-item>（不带 label）内，间距开箱即用。
      -->
      <!--
        <el-form>
          <el-form-item label="..."><el-input /></el-form-item>
        </el-form>
        <div>  ← 按钮放在 form 外面，没 form-item 包裹
          <el-button type="primary">提交</el-button>
          <el-button>取消</el-button>
        </div>
      -->

      <!--
        @anti-pattern #2: 表单按钮没 loading 反馈
        @priority: SOFT
        后果：用户点击后瞬间不知道是否点中，可能重复点击；网络慢时体验更差。
        正确：异步提交时绑定 :loading="submitting"，提交开始时设 true，结束设 false。
      -->
      <!-- <el-button type="primary" @click="handleSubmit">提交</el-button> -->

      <!--
        @anti-pattern #3: 多行文本用 el-input 不带 type="textarea"
        @priority: STRONG
        后果：备注、描述等多行场景只能输入单行，超长内容看不到。
        正确：type="textarea" + :rows="3" 设定显示行数；超过会内部滚动。
      -->
      <!-- <el-input v-model="form.remark" placeholder="多行..." /> -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 4：inline 表单（横排筛选/搜索栏）                        -->
    <!-- ============================================================ -->
    <section>
      <h3>4. inline 表单</h3>

      <!-- ✅ 推荐：inline 用于工具栏/筛选条（横排），form-item 之间自带 32px 间距 -->
      <el-form :model="form5" inline>
        <el-form-item label="姓名">
          <el-input v-model="form5.name" placeholder="" style="width: 160px;" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="form5.dept" placeholder="" style="width: 140px;">
            <el-option label="设计部" value="design" />
            <el-option label="研发部" value="dev" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>

      <!--
        @depends-on: form.scss 把 .el-form--inline 实现为 flex + column-gap: 32px + row-gap: spacing-3
                     （form-item 自身 margin 全清零），所以 form-item 之间间距由 column-gap 提供，
                     wrap 时由 row-gap 提供纵向间距。
        @when-changed: 不要在使用方覆盖 .el-form--inline { display: ... }——
                       改回 inline-block 会让 column-gap 失效，间距全无。
      -->
    </section>

    <!-- ============================================================ -->
    <!-- 示例 5：尺寸变体                                              -->
    <!-- ============================================================ -->
    <section>
      <h3>5. 尺寸变体</h3>

      <!-- ✅ 推荐：通过 size 属性切换，label / input / button 整体跟随 -->
      <div class="row">
        <el-form :model="form6" size="large" label-width="80px" style="width: 240px;">
          <el-form-item label="Large">
            <el-input v-model="form6.a" />
          </el-form-item>
        </el-form>
        <el-form :model="form6" label-width="80px" style="width: 240px;">
          <el-form-item label="Default">
            <el-input v-model="form6.b" />
          </el-form-item>
        </el-form>
        <el-form :model="form6" size="small" label-width="80px" style="width: 240px;">
          <el-form-item label="Small">
            <el-input v-model="form6.c" />
          </el-form-item>
        </el-form>
      </div>

      <!--
        @depends-on: form size 由 EP 的 --font-size scoped 变量驱动，
                     form.scss 显式覆盖了 large/default/small 三档变体。
        @when-changed: 升级 EP 大版本时，若 EP 改了 scoped 变量命名，
                       el-theme/components/form.scss 需要同步调整。
      -->
    </section>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const form2 = reactive({ username: '', email: '' })

const formRef = ref<FormInstance>()
const submitting = ref(false)
const form3 = reactive({ username: '', email: '' })
const rules3: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  // 模拟异步提交
  await new Promise((r) => setTimeout(r, 800))
  submitting.value = false
  ElMessage.success('提交成功')
}

function handleReset() {
  formRef.value?.resetFields()
}

const form4 = reactive({ remark: '' })
const form5 = reactive({ name: '', dept: '' })
const form6 = reactive({ a: '', b: '', c: '' })
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
.row {
  display: flex;
  gap: var(--iflyv-spacing-6, 24px);
  flex-wrap: wrap;
}
</style>
