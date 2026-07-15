import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const apiKey     = import.meta.env.VITE_FIREBASE_API_KEY     as string | undefined
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
const projectId  = import.meta.env.VITE_FIREBASE_PROJECT_ID  as string | undefined
const appId      = import.meta.env.VITE_FIREBASE_APP_ID      as string | undefined

if (!projectId) {
  console.warn(
    '[Firebase] VITE_FIREBASE_PROJECT_ID is not set. ' +
    'Create a .env.local file with your Firebase config. ' +
    'Dashboards will show placeholder values until configured.'
  )
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  appId,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const isConfigured = Boolean(projectId)
