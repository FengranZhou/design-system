<template>
  <section id="avatar" class="demo-section">
    <h2 class="demo-section__title">Avatar 头像</h2>

    <div class="demo-block">
      <p class="demo-label">内置角色 —— 教师 / 学生</p>
      <div class="demo-row" style="gap: 40px;">
        <div v-for="item in roles" :key="item.role" class="avatar-cell">
          <UserAvatar :role="item.role" :size="56" />
          <span class="avatar-cell__label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">尺寸 —— size</p>
      <div class="demo-row" style="align-items: flex-end; gap: 40px;">
        <div v-for="s in sizes" :key="s" class="avatar-cell">
          <UserAvatar role="teacher-male" :size="s" />
          <span class="avatar-cell__label">{{ s }}px</span>
        </div>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">头像组 —— Avatar Group</p>
      <div class="avatar-group">
        <UserAvatar
          v-for="item in roles"
          :key="item.role"
          :role="item.role"
          :size="40"
          class="avatar-group__item"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import UserAvatar from './UserAvatar.vue'
import { AVATAR_LABEL, type AvatarRole } from './avatar-roles'

const roles = (Object.keys(AVATAR_LABEL) as AvatarRole[]).map((role) => ({
  role,
  label: AVATAR_LABEL[role],
}))

const sizes = [20, 24, 40]
</script>

<style scoped>
.avatar-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-cell__label {
  font-size: 13px;
  color: var(--iflyv-text-3);
}

.avatar-group {
  display: flex;
}

.avatar-group__item:not(:first-child) {
  margin-inline-start: -12px;
}

.avatar-group__item {
  box-shadow: 0 0 0 2px #fff;
  border-radius: 50%;
}
</style>
