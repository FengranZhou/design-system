<template>
  <el-avatar :size="size" :src="src" :shape="shape" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AVATAR_MAP, type AvatarRole } from './avatar-roles'

const props = withDefaults(
  defineProps<{
    /** 角色，命中内置头像时使用对应图片 */
    role?: AvatarRole
    /** 自定义头像地址，优先级高于 role */
    src?: string
    size?: number | 'large' | 'default' | 'small'
    shape?: 'circle' | 'square'
  }>(),
  {
    size: 40,
    shape: 'circle',
  },
)

const src = computed(() => props.src ?? (props.role ? AVATAR_MAP[props.role] : undefined))
</script>
