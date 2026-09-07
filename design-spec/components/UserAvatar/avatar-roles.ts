/** 内置角色头像 —— 教师/学生男女四款 */
export type AvatarRole = 'teacher-male' | 'teacher-female' | 'student-male' | 'student-female'

// 图片随组件走（本目录 assets/），用 import 让引用方打包时由构建工具处理，
// 不依赖使用方 public/ 下有对应文件 —— 这是业务组件「自包含、可被外部引用」的关键。
import teacherMale from './assets/男教师.png'
import teacherFemale from './assets/女教师.png'
import studentMale from './assets/男学生.png'
import studentFemale from './assets/女学生.png'

/** 角色 → 头像图片（构建后解析为最终资源 URL） */
export const AVATAR_MAP: Record<AvatarRole, string> = {
  'teacher-male': teacherMale,
  'teacher-female': teacherFemale,
  'student-male': studentMale,
  'student-female': studentFemale,
}

/** 角色 → 中文标签，供演示/选择器使用 */
export const AVATAR_LABEL: Record<AvatarRole, string> = {
  'teacher-male': '男教师',
  'teacher-female': '女教师',
  'student-male': '男学生',
  'student-female': '女学生',
}
