<!--
  UserAvatar —— 用户头像（业务组件层）

  封装 el-avatar，内置「教师/学生 男女」四款角色头像（图片随组件走，见 avatar-roles.ts）。
  - 传 role 命中内置角色图；传 src 用自定义地址（优先级高于 role）。
  - 尺寸标准三档（从大到小）：40（默认）/ 24 / 20，尽量只用这三档保持全站一致。

  内部只引用基础组件 el-avatar（外观归 el-theme 源头，不覆盖）。

  接入方速查：
    内置角色：  <UserAvatar role="teacher-male" />
    自定义图：  <UserAvatar :src="url" :size="24" />
-->
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
    /**
     * 头像尺寸（px）。标准三档，从大到小：**40（默认）/ 24 / 20**。
     * 尽量只用这三档以保持全站头像尺寸一致；仅在特殊场景（如超大展示位）才传其它数字。
     * 也兼容 EP 的 'large' | 'default' | 'small' 关键字，但优先用三档数字。
     */
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
