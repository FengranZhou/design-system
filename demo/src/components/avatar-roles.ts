/** 内置角色头像 —— 教师/学生男女四款 */
export type AvatarRole = 'teacher-male' | 'teacher-female' | 'student-male' | 'student-female'

/** 角色 → 头像图片路径（位于 public/avatars/） */
export const AVATAR_MAP: Record<AvatarRole, string> = {
  'teacher-male': '/avatars/男教师.png',
  'teacher-female': '/avatars/女教师.png',
  'student-male': '/avatars/男学生.png',
  'student-female': '/avatars/女学生.png',
}

/** 角色 → 中文标签，供演示/选择器使用 */
export const AVATAR_LABEL: Record<AvatarRole, string> = {
  'teacher-male': '男教师',
  'teacher-female': '女教师',
  'student-male': '男学生',
  'student-female': '女学生',
}
