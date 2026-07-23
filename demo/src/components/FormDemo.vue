<template>
  <section id="form" class="demo-section">
    <h2 class="demo-section__title">Form 表单</h2>

    <div class="demo-block">
      <p class="demo-label">顶部标签表单（label-position="top"）</p>
      <el-form :model="formDataTop" :rules="rulesTop" label-position="top" style="max-width: 500px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formDataTop.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formDataTop.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="formDataTop.department" placeholder="请选择部门" style="width: 100%;">
            <el-option label="设计部" value="design" />
            <el-option label="研发部" value="dev" />
            <el-option label="产品部" value="product" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期">
          <el-date-picker v-model="formDataTop.date" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="formDataTop.notify">
            <el-checkbox label="邮件" value="email" />
            <el-checkbox label="短信" value="sms" />
            <el-checkbox label="站内信" value="internal" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formDataTop.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">提交</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="demo-block">
      <p class="demo-label">带校验的完整表单</p>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" style="max-width: 500px;">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="部门" prop="department">
        <el-select v-model="formData.department" placeholder="请选择部门" style="width: 100%;">
          <el-option label="设计部" value="design" />
          <el-option label="研发部" value="dev" />
          <el-option label="产品部" value="product" />
        </el-select>
      </el-form-item>
      <el-form-item label="入职日期" prop="date">
        <el-date-picker v-model="formData.date" type="date" placeholder="选择日期" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="通知方式" prop="notify">
        <el-checkbox-group v-model="formData.notify">
          <el-checkbox label="邮件" value="email" />
          <el-checkbox label="短信" value="sms" />
          <el-checkbox label="站内信" value="internal" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="启用状态">
        <el-switch v-model="formData.enabled" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const formDataTop = reactive({
  username: '',
  email: '',
  department: '',
  date: '',
  notify: [] as string[],
  remark: '',
})

const rulesTop: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

const formRef = ref<FormInstance>()

const formData = reactive({
  username: '',
  email: '',
  department: '',
  date: '',
  notify: [] as string[],
  enabled: true,
  remark: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('表单验证通过')
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>
