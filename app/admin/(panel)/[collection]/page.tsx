import { COLLECTION_FORMS } from '@/lib/admin/forms'
import { toListRows } from '@/lib/admin/listRows'
import { listCollection } from '@/lib/admin/queries'
import { collectionFromParam } from '@/lib/admin/routeParams'
import { EntryList } from '@/components/admin/EntryList'

export default async function CollectionListPage({ params }: { params: { collection: string } }) {
  const collection = collectionFromParam(params.collection)
  const form = COLLECTION_FORMS[collection]
  const rows = toListRows(collection, await listCollection(collection))
  return (
    <EntryList
      basePath={`/admin/${collection}`}
      title={form.plural}
      addLabel={form.addLabel}
      rows={rows}
      withThumbnails={collection !== 'faq'}
    />
  )
}
