import { getSettings } from '@/lib/admin/queries'
import { EntryEditor } from '@/components/admin/EntryEditor'

export default async function DealersSettingsPage() {
  const entry = await getSettings('dealers')
  return (
    <EntryEditor
      key={entry.version}
      target={{ kind: 'settings', key: 'dealers' }}
      initial={entry.data}
      version={entry.version}
      updatedAt={entry.updatedAt}
      updatedBy={entry.updatedBy}
    />
  )
}
