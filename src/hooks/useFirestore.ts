import { useEffect, useState } from 'react'
import {
  doc, collection,
  onSnapshot,
  query, orderBy,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'
import { db, isConfigured } from '../lib/firebase'

interface FirestoreState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Subscribe to a single Firestore document with onSnapshot.
 * Returns { data, loading, error }.
 * When Firebase is not configured, returns { data: null, loading: false, error: null }
 * immediately so callers can fall back to defaults.
 */
export function useDocument<T = DocumentData>(path: string): FirestoreState<T> {
  const [state, setState] = useState<FirestoreState<T>>({
    data: null,
    loading: isConfigured,
    error: null,
  })

  useEffect(() => {
    if (!isConfigured) return

    const ref = doc(db, path)
    const unsub = onSnapshot(
      ref,
      snap => {
        setState({ data: snap.exists() ? (snap.data() as T) : null, loading: false, error: null })
      },
      err => {
        console.error(`[useDocument] ${path}:`, err)
        setState(s => ({ ...s, loading: false, error: err.message }))
      }
    )
    return unsub
  }, [path])

  return state
}

/**
 * Subscribe to a Firestore collection with onSnapshot.
 * Pass an optional `orderByField` to sort results server-side.
 * Returns { data, loading, error }.
 */
export function useCollection<T = DocumentData>(
  path: string,
  orderByField?: string
): FirestoreState<T[]> {
  const [state, setState] = useState<FirestoreState<T[]>>({
    data: null,
    loading: isConfigured,
    error: null,
  })

  useEffect(() => {
    if (!isConfigured) return

    const constraints: QueryConstraint[] = []
    if (orderByField) constraints.push(orderBy(orderByField))

    const ref = query(collection(db, path), ...constraints)
    const unsub = onSnapshot(
      ref,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }) as T)
        setState({ data: docs, loading: false, error: null })
      },
      err => {
        console.error(`[useCollection] ${path}:`, err)
        setState(s => ({ ...s, loading: false, error: err.message }))
      }
    )
    return unsub
  }, [path, orderByField])

  return state
}
