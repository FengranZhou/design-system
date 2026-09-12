import { Avatar } from 'antd'
import { AVATAR_MAP, type AvatarRole } from '../avatar-roles'

export default function UserAvatar(props: {
  role?: AvatarRole
  src?: string
  size?: number
  shape?: 'circle' | 'square'
}) {
  const { role, src, size = 40, shape = 'circle' } = props
  const finalSrc = src ?? (role ? AVATAR_MAP[role] : undefined)
  return <Avatar size={size} src={finalSrc} shape={shape} />
}
