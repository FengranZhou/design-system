<template>
  <section id="drawer" class="demo-section">
    <h2 class="demo-section__title">Drawer 抽屉
      <CopyToCC anchor="drawer" :values="drawerConfigForm" />
    </h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">适用于辅助信息展示场景，相比对话框，承载信息量更多，抽屉内信息关联度更低，任务连贯性更强，页面遮挡更少。</p>
        <!-- 单条实时示例：按钮有无 + 按钮布局作为配置项 -->
        <div class="demo-row">
          <el-button type="primary" @click="drawerVisible = true">打开抽屉</el-button>
        </div>

        <el-drawer v-model="drawerVisible" :title="drawerHasFooter ? '编辑信息' : '抽屉标题'" size="400px">
          <p style="color: var(--iflyv-text-2);">这是抽屉的内容区域。</p>
          <template v-if="drawerHasFooter" #footer>
            <div v-if="drawerFooterLayout === 'vertical'" class="drawer-footer--vertical">
              <el-button type="primary" @click="drawerVisible = false">确定</el-button>
              <el-button @click="drawerVisible = false">取消</el-button>
            </div>
            <template v-else>
              <el-button @click="drawerVisible = false">取消</el-button>
              <el-button type="primary" @click="drawerVisible = false">确定</el-button>
            </template>
          </template>
        </el-drawer>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="drawerConfigForm" label-width="auto">
          <el-form-item label="底部按钮">
            <el-switch v-model="drawerHasFooter" />
          </el-form-item>
          <el-form-item v-if="drawerHasFooter" label="按钮布局">
            <el-radio-group v-model="drawerFooterLayout">
              <el-radio value="horizontal">水平</el-radio>
              <el-radio value="vertical">垂直</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
import { ref, reactive } from 'vue'

// —— 抽屉（Drawer）：底部按钮有无 + 按钮布局（水平/垂直）作为配置项 ——
const drawerVisible = ref(false)
const drawerHasFooter = ref(false)          // 是否显示底部按钮
const drawerFooterLayout = ref<'horizontal' | 'vertical'>('horizontal')  // 底部按钮布局
const drawerConfigForm = reactive({ drawerHasFooter, drawerFooterLayout })
</script>

<style scoped>

/* 本页配置项多（多行表单/单选组），配置卡加宽一档 */
.config-card {
  flex: 0 0 auto;
  width: 400px;
}

</style>
