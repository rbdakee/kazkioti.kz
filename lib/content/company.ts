import { fetchSettings } from '@/lib/cms/client'
import { PDF_CATALOG_URL } from '@/lib/constants'

export interface CompanyContacts {
  /** As shown to people, e.g. "+7 747 876 44 44". */
  phoneHuman: string
  /** For `tel:` links, e.g. "+77478764444". */
  phoneTel: string
  email: string
  address: string
  /** PDF behind the "Download catalog" button. */
  catalogUrl: string
}

export function toPhoneTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

export async function getCompanyContacts(): Promise<CompanyContacts> {
  const company = await fetchSettings('company')
  return {
    phoneHuman: company.phone,
    phoneTel: toPhoneTel(company.phone),
    email: company.email,
    address: company.address,
    catalogUrl: company.catalogPdf ?? PDF_CATALOG_URL,
  }
}
