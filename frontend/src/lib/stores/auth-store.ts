import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { AuthUser } from '@/lib/types'

export const tokenAtom = atomWithStorage<string | null>('sportival_token', null)
export const userAtom = atom<AuthUser | null>(null)
export const isAuthenticatedAtom = atom((get) => !!get(tokenAtom))
