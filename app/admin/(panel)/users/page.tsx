import { adminFetch } from '@/lib/admin/api'
import { getMe, type AdminUser } from '@/lib/admin/queries'
import { cmsUrl } from '@/lib/cms/client'
import { ApiTokensManager, type ApiTokenRow } from '@/components/admin/ApiTokensManager'
import { UsersManager } from '@/components/admin/UsersManager'

export default async function UsersPage() {
  const [me, users, tokens] = await Promise.all([
    getMe(),
    adminFetch<AdminUser[]>('/users'),
    adminFetch<ApiTokenRow[]>('/tokens'),
  ])
  return (
    <UsersManager users={users} currentUserId={me.id}>
      <ApiTokensManager tokens={tokens} mcpUrl={`${cmsUrl()}/mcp`} />
    </UsersManager>
  )
}
