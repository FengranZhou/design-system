<template>
  <section id="badge" class="demo-section">
    <h2 class="demo-section__title">Badge 徽标</h2>

    <!-- 徽标：四类载体（头像/按钮/图标/Tab）通过配置项切换，每类固定四状态（点 / 数字 / 上限 99+ / 英文） -->
    <div class="demo-block badge-showcase">
      <div class="badge-showcase__main">
        <p class="demo-desc">用于显示需要处理的消息条数，通过醒目视觉形式吸引用户处理。</p>

        <!-- 头像 -->
        <div v-if="badgeType === 'avatar'" class="demo-row" style="gap: 24px;">
          <el-badge is-dot>
            <UserAvatar :size="28" role="teacher-male" />
          </el-badge>
          <el-badge :value="12">
            <UserAvatar :size="28" role="teacher-female" />
          </el-badge>
          <el-badge :value="100" :max="99">
            <UserAvatar :size="28" role="student-male" />
          </el-badge>
          <el-badge value="new">
            <UserAvatar :size="28" role="student-female" />
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
            <Mail :size="20" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge :value="8">
            <Bell :size="20" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge :value="100" :max="99">
            <MessageSquare :size="20" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
          </el-badge>
          <el-badge value="new">
            <Heart :size="20" :stroke-width="2" style="color: var(--iflyv-icon-2); cursor: pointer;" />
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

/* 徽标块：左列（标题+示例）+ 右列配置卡，配置卡顶与标题顶齐平 */
.badge-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.badge-showcase__main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .badge-showcase { flex-direction: column; }
}

/* 配置项内单选纵向排列，占满配置卡宽度 */
.config-card :deep(.el-radio-group) {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--iflyv-spacing-2);
}

/* 徽标气泡为绝对定位、会向上溢出宿主盒顶边约半个气泡高，默认 12px 间距会被视觉吃掉；
   本页说明与示例行的间距放大到 spacing-5(20)。仅本页 scoped，不影响其他页的 .demo-desc。 */
.badge-showcase .demo-desc {
  margin-bottom: var(--iflyv-spacing-5);
}
</style>
