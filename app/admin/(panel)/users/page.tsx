import { adminFetch } from '@/lib/admin/api'
import { getMe, type AdminUser } from '@/lib/admin/queries'
import { UsersManager } from '@/components/admin/UsersManager'

export default async function UsersPage() {
  const [me, users] = await Promise.all([getMe(), adminFetch<AdminUser[]>('/users')])
  return <UsersManager users={users} currentUserId={me.id} />
}
