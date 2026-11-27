import { getSettings } from '@/lib/admin/queries'
import { EntryEditor } from '@/components/admin/EntryEditor'

export default async function ContactsSettingsPage() {
  const entry = await getSettings('company')
  return (
    <EntryEditor
      key={entry.version}
      target={{ kind: 'settings', key: 'company' }}
      initial={entry.data}
      version={entry.version}
      updatedAt={entry.updatedAt}
      updatedBy={entry.updatedBy}
    />
  )
}
