<template>
  <section id="badge" class="demo-section">
    <h2 class="demo-section__title">Badge 徽标</h2>

    <!-- 徽标：四类载体（头像/按钮/图标/Tab）通过配置项切换，每类固定四状态（点 / 数字 / 上限 99+ / 英文） -->
    <div class="demo-block badge-showcase">
      <div class="badge-showcase__main">
        <p class="demo-label">徽标</p>

        <!-- 头像 -->
        <div v-if="badgeType === 'avatar'" class="demo-row" style="gap: 24px;">
          <el-badge is-dot>
            <UserAvatar :size="40" role="teacher-male" />
          </el-badge>
          <el-badge :value="12">
            <UserAvatar :size="40" role="teacher-female" />
          </el-badge>
          <el-badge :value="100" :max="99">
            <UserAvatar :size="40" role="student-male" />
          </el-badge>
          <el-badge value="new">
            <UserAvatar :size="40" role="student-female" />
          </el-badge>
        </div>

        <!-- 按钮 -->
        <div v-else-if="badgeType === 'button'" class="demo-row">
          <el-badge is-dot>
            <el-button>通知</el-button>
          </el-badge>
          <el-badge :value="5">
            <el-button>消息</el-button>
          </el-badge>
          <el-badge :value="100" :max="99">
            <el-button>待处理</el-button>
          </el-badge>
          <el-badge value="hot">
            <el-button>活动</el-button>
          </el-badge>
        </div>

        <!-- 图标 -->
        <div v-else-if="badgeType === 'icon'" class="demo-row" style="gap: 32px;">
          <el-badge is-dot>
            <Mail :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge :value="8">
            <Bell :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge :value="100" :max="99">
            <MessageSquare :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge value="new">
            <Heart :size="22" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
        </div>

        <!-- Tab 导航项：badge 挂 tab 用源头约定 .tab-badge（定位 + 选中态不下沉统一在源头，不手写 offset） -->
        <el-tabs v-else class="badge-tabs">
          <el-tab-pane>
            <template #label>
              <el-badge is-dot class="tab-badge">待审核</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <el-badge :value="3" class="tab-badge">全部任务</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <el-badge :value="100" :max="99" class="tab-badge">已完成</el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane>
            <template #label>
              <el-badge value="new" class="tab-badge">最新</el-badge>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form label-width="auto">
          <el-form-item label="类型">
            <el-radio-group v-model="badgeType">
              <el-radio value="avatar">头像</el-radio>
              <el-radio value="button">按钮</el-radio>
              <el-radio value="icon">图标</el-radio>
              <el-radio value="tab">tab 栏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Mail, MessageSquare, Heart } from 'lucide-vue-next'
import { UserAvatar } from '../../../design-spec/components'

// 徽标载体类型：头像 / 按钮 / 图标 / tab 栏
const badgeType = ref('avatar')
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Cell / Input / Radio 配置式范式一致，纯本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}

/* 徽标块：左列（标题+示例）+ 右列配置卡，配置卡顶与标题顶齐平 */
.badge-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.badge-showcase__main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .badge-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}

/* 配置卡在块卡（bg-card）内部，白底 + 细边框区分层次，避免同色套同色 */
.config-card {
  flex: 0 1 auto;
  width: 220px;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
/* 配置项内单选纵向排列，占满配置卡宽度 */
.config-card :deep(.el-radio-group) {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--iflyv-spacing-2);
}
</style>
