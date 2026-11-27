import { COLLECTION_FORMS } from '@/lib/admin/forms'
import { relationIndex } from '@/lib/admin/queries'
import { RELATED_COLLECTIONS, collectionFromParam } from '@/lib/admin/routeParams'
import { EntryEditor } from '@/components/admin/EntryEditor'

export default async function NewEntryPage({ params }: { params: { collection: string } }) {
  const collection = collectionFromParam(params.collection)
  const relations = await relationIndex(RELATED_COLLECTIONS[collection])
  return (
    <EntryEditor
      target={{ kind: 'collection', collection, slug: null }}
      initial={COLLECTION_FORMS[collection].emptyDoc()}
      relations={relations}
    />
  )
}
