<template>
  <section id="avatar" class="demo-section">
    <h2 class="demo-section__title">Avatar 头像</h2>

    <div class="demo-block avatar-showcase">
      <div class="avatar-showcase__main">

        <!-- 独立：四个内置角色各自展示，带角色名 -->
        <div v-if="avatarMode === 'single'" class="demo-row" style="gap: var(--iflyv-spacing-10);">
          <div v-for="item in roles" :key="item.role" class="avatar-cell">
            <UserAvatar :role="item.role" :size="avatarSize" />
            <span class="avatar-cell__label">{{ item.label }}</span>
          </div>
        </div>

        <!-- 组合：头像组叠加 -->
        <div v-else class="avatar-group" :style="{ '--avatar-overlap': `${Math.round(avatarSize * 0.3)}px` }">
          <UserAvatar
            v-for="item in roles"
            :key="item.role"
            :role="item.role"
            :size="avatarSize"
            class="avatar-group__item"
          />
        </div>
      </div>

      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form label-width="auto">
          <el-form-item label="展示">
            <el-radio-group v-model="avatarMode">
              <el-radio value="single">独立</el-radio>
              <el-radio value="group">组合</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="尺寸">
            <el-radio-group v-model="avatarSize">
              <el-radio :value="28">28px</el-radio>
              <el-radio :value="24">24px</el-radio>
              <el-radio :value="20">20px</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserAvatar, AVATAR_LABEL, type AvatarRole } from '../../../design-spec/components'

const roles = (Object.keys(AVATAR_LABEL) as AvatarRole[]).map((role) => ({
  role,
  label: AVATAR_LABEL[role],
}))

// 配置项：展示方式（独立/组合）+ 尺寸
const avatarMode = ref<'single' | 'group'>('single')
const avatarSize = ref(28)
</script>

<style scoped>

/* 头像块：左列（标题+示例）+ 右列配置卡，配置卡顶与标题顶齐平 */
.avatar-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.avatar-showcase__main { flex: 1; min-width: 0; }

.config-card :deep(.el-radio-group) {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--iflyv-spacing-2);
}

.avatar-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--iflyv-spacing-2);
}

.avatar-cell__label {
  font: var(--iflyv-font-body-sub);
  color: var(--iflyv-text-3);
}

.avatar-group {
  display: flex;
}

.avatar-group__item:not(:first-child) {
  /* 重叠量随头像尺寸按比例缩放（约 30%），小尺寸不再显得过挤；默认 40px→12px */
  margin-inline-start: calc(-1 * var(--avatar-overlap, 12px));
}

.avatar-group__item {
  box-shadow: 0 0 0 2px var(--iflyv-bg-panel);
  border-radius: 50%;
}
</style>
