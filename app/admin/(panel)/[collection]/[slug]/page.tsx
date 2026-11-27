import { notFound } from 'next/navigation'
import { AdminApiError } from '@/lib/admin/api'
import { getEntry, relationIndex } from '@/lib/admin/queries'
import { RELATED_COLLECTIONS, collectionFromParam } from '@/lib/admin/routeParams'
import { EntryEditor } from '@/components/admin/EntryEditor'

export default async function EditEntryPage({ params }: { params: { collection: string; slug: string } }) {
  const collection = collectionFromParam(params.collection)
  const [entry, relations] = await Promise.all([
    getEntry(collection, params.slug).catch((error: unknown) => {
      if (error instanceof AdminApiError && error.status === 404) notFound()
      throw error
    }),
    relationIndex(RELATED_COLLECTIONS[collection]),
  ])
  return (
    <EntryEditor
      key={`${entry.slug}-${entry.version}`}
      target={{ kind: 'collection', collection, slug: entry.slug }}
      initial={entry.data}
      version={entry.version}
      updatedAt={entry.updatedAt}
      updatedBy={entry.updatedBy}
      relations={relations}
    />
  )
}
