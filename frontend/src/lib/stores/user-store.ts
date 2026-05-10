import { atom } from 'jotai'
import { User } from '@/lib/models/user'

export const currentUserAtom = atom<User | null>(null)
export const isUserLoadingAtom = atom<boolean>(false)
export const isAuthenticatedAtom = atom((get) => get(currentUserAtom) !== null)
export const isAdminAtom = atom((get) => get(currentUserAtom)?.role === 'admin')
