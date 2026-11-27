import Image from 'next/image'
import { getAdminLang } from '@/lib/admin/lang.server'
import { UI } from '@/lib/admin/i18n'
import { LangSwitch } from '@/components/admin/LangSwitch'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata = { title: 'Вход' }

export default function LoginPage() {
  const lang = getAdminLang()
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="relative hidden overflow-hidden bg-bg-invert lg:block">
        <img src="/images/factory/main.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Image src="/logo.png" alt="KAZKIOTI" width={420} height={96} className="h-8 w-auto self-start" priority />
          <div className="max-w-md">
            <p className="font-mono text-mono-label uppercase tracking-widest text-white/60">{UI.appName[lang]}</p>
            <p className="mt-4 font-heading text-[34px] font-bold leading-tight">
              {lang === 'kk' ? 'Каталог, жаңалықтар және байланыстар — бір жерде.' : 'Каталог, новости и контакты — в одном месте.'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex justify-end">
          <LangSwitch />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 py-12">
          <div className="flex flex-col gap-2">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-bg-invert lg:hidden">
              <span className="font-heading text-[15px] font-bold text-white">K</span>
            </div>
            <h1 className="font-heading text-[28px] font-bold text-text-primary">{UI.signInTitle[lang]}</h1>
            <p className="text-[14px] text-text-muted">KAZKIOTI</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
