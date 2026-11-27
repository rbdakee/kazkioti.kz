'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { AlertCircle } from 'lucide-react'
import { loginAction, type LoginState } from '@/app/admin/actions'
import { UI } from '@/lib/admin/i18n'
import { useT } from './AdminLang'
import { AdminButton, FieldShell, TextInput } from './ui'

const ERROR_LABEL = { invalid: UI.invalidCredentials, throttled: UI.tooManyAttempts, unavailable: UI.serverUnavailable } as const

function SubmitButton() {
  const t = useT()
  const { pending } = useFormStatus()
  return (
    <AdminButton type="submit" tone="primary" loading={pending} className="h-11 w-full">
      {t(UI.signIn)}
    </AdminButton>
  )
}

export function LoginForm() {
  const t = useT()
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, {})
  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-brand-red/20 bg-brand-red/[0.05] px-3 py-2.5 text-[13px] text-brand-red">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {t(ERROR_LABEL[state.error])}
        </div>
      ) : null}
      <FieldShell label={t(UI.login)} htmlFor="login">
        <TextInput id="login" name="login" autoComplete="username" required autoFocus className="h-11" />
      </FieldShell>
      <FieldShell label={t(UI.password)} htmlFor="password">
        <TextInput id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
      </FieldShell>
      <SubmitButton />
    </form>
  )
}
