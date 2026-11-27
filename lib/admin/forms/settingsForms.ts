import type { SettingsKey } from '@/shared/content'
import { companyForm, dealersForm, type SettingsFormConfig } from './settings'

export const SETTINGS_FORMS: Record<SettingsKey, SettingsFormConfig> = {
  company: companyForm,
  dealers: dealersForm,
}
