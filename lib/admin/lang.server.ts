import 'server-only'
import { cookies } from 'next/headers'
import { isAdminLang, type AdminLang } from './i18n'
import { ADMIN_LANG_COOKIE } from './session'

export function getAdminLang(): AdminLang {
  const value = cookies().get(ADMIN_LANG_COOKIE)?.value
  return isAdminLang(value) ? value : 'ru'
}
