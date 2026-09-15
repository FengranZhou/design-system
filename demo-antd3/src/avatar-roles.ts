import teacherMale from '../../design-spec/components/UserAvatar/assets/男教师.png'
import teacherFemale from '../../design-spec/components/UserAvatar/assets/女教师.png'
import studentMale from '../../design-spec/components/UserAvatar/assets/男学生.png'
import studentFemale from '../../design-spec/components/UserAvatar/assets/女学生.png'

export type AvatarRole = 'teacher-male' | 'teacher-female' | 'student-male' | 'student-female'

export const AVATAR_MAP: Record<AvatarRole, string> = {
  'teacher-male': teacherMale,
  'teacher-female': teacherFemale,
  'student-male': studentMale,
  'student-female': studentFemale,
}

export const AVATAR_LABEL: Record<AvatarRole, string> = {
  'teacher-male': '男教师',
  'teacher-female': '女教师',
  'student-male': '男学生',
  'student-female': '女学生',
}
