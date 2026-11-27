'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Trash2, UserPlus } from 'lucide-react'
import { changePasswordAction, createUserAction, deleteUserAction } from '@/app/admin/actions'
import { UI } from '@/lib/admin/i18n'
import { useT } from './AdminLang'
import { ConfirmDialog } from './ConfirmDialog'
import { useToast } from './Toaster'
import { AdminButton, Badge, Card, FieldShell, IconButton, TextInput } from './ui'

interface UserRow {
  id: number
  login: string
  name: string
}

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: number }) {
  const t = useT()
  const toast = useToast()
  const router = useRouter()
  const [busy, setBusy] = useState<'create' | 'password' | 'delete' | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null)

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy('create')
    const result = await createUserAction({
      login: String(data.get('login') ?? ''),
      name: String(data.get('name') ?? ''),
      password: String(data.get('password') ?? ''),
    })
    setBusy(null)
    if (result.ok) {
      form.reset()
      toast({ tone: 'success', message: t(UI.userCreated) })
      router.refresh()
    } else {
      toast({ tone: 'error', message: result.error === 'conflict' ? t(UI.loginTaken) : result.error === 'validation' ? t(UI.fixErrors) : t(UI.genericError) })
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy('password')
    const result = await changePasswordAction({
      currentPassword: String(data.get('currentPassword') ?? ''),
      newPassword: String(data.get('newPassword') ?? ''),
    })
    setBusy(null)
    if (result.ok) {
      toast({ tone: 'success', message: t(UI.passwordChanged) })
      router.push('/admin/login')
    } else {
      toast({ tone: 'error', message: result.error === 'validation' ? t(UI.fixErrors) : t(UI.invalidCredentials) })
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setBusy('delete')
    const result = await deleteUserAction(pendingDelete.id)
    setBusy(null)
    setPendingDelete(null)
    if (result.ok) router.refresh()
    else toast({ tone: 'error', message: t(UI.genericError) })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-[26px] font-bold text-text-primary">{t(UI.users)}</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card title={t(UI.users)}>
          <ul className="-my-2 divide-y divide-border">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-muted font-heading text-[14px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold">{user.name}</span>
                  <span className="truncate text-[12px] text-text-muted">{user.login}</span>
                </span>
                {user.id === currentUserId ? (
                  <Badge tone="blue">{t(UI.you)}</Badge>
                ) : (
                  <IconButton label={t(UI.delete)} onClick={() => setPendingDelete(user)} className="hover:text-brand-red">
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        </Card>
        <div className="flex flex-col gap-6">
          <Card title={t(UI.newUser)}>
            <form onSubmit={(event) => void createUser(event)} className="flex flex-col gap-4">
              <FieldShell label={t(UI.name)} htmlFor="new-name" required>
                <TextInput id="new-name" name="name" required maxLength={100} />
              </FieldShell>
              <FieldShell label={t(UI.login)} htmlFor="new-login" required>
                <TextInput id="new-login" name="login" required minLength={3} maxLength={64} pattern="[\w.@\-]+" autoComplete="off" />
              </FieldShell>
              <FieldShell label={t(UI.newPassword)} htmlFor="new-password" required>
                <TextInput id="new-password" name="password" type="password" required minLength={10} autoComplete="new-password" />
              </FieldShell>
              <AdminButton type="submit" tone="primary" loading={busy === 'create'} icon={<UserPlus className="h-4 w-4" />}>
                {t(UI.add)}
              </AdminButton>
            </form>
          </Card>
          <Card title={t(UI.changePassword)}>
            <form onSubmit={(event) => void changePassword(event)} className="flex flex-col gap-4">
              <FieldShell label={t(UI.currentPassword)} htmlFor="current-password" required>
                <TextInput id="current-password" name="currentPassword" type="password" required autoComplete="current-password" />
              </FieldShell>
              <FieldShell label={t(UI.newPassword)} htmlFor="next-password" required>
                <TextInput id="next-password" name="newPassword" type="password" required minLength={10} autoComplete="new-password" />
              </FieldShell>
              <AdminButton type="submit" loading={busy === 'password'} icon={<KeyRound className="h-4 w-4" />}>
                {t(UI.changePassword)}
              </AdminButton>
            </form>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        title={`${t(UI.delete)}: ${pendingDelete?.name ?? ''}?`}
        description={pendingDelete?.login ?? ''}
        confirmLabel={t(UI.delete)}
        cancelLabel={t(UI.cancel)}
        busy={busy === 'delete'}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
