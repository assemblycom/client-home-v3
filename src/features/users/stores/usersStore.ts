import type { ClientsDto, CompaniesDto } from '@users/users.dto'
import { create } from 'zustand'

interface UsersState {
  isInitialized: boolean
  previewClientId: string | null
  previewCompanyId: string | null
  clients: ClientsDto[]
  companies: CompaniesDto[]
  previewClient: ClientsDto | null
  previewCompany: CompaniesDto | null
}

interface UsersActions {
  setInitialized: (isInitialized: boolean) => void
  setClients: (clients: ClientsDto[]) => void
  setCompanies: (companies: CompaniesDto[]) => void
  setPreviewClientId: (clientId: string) => void
  setPreviewCompanyId: (companyId: string) => void
}

const initialState: UsersState = {
  isInitialized: false,
  clients: [],
  companies: [],
  previewClientId: null,
  previewCompanyId: null,
  previewClient: null,
  previewCompany: null,
}

export const useUsersStore = create<UsersState & UsersActions>()((set) => ({
  ...initialState,
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setClients: (clients: ClientsDto[]) => {
    set({ clients, previewClient: clients[0] ?? null, previewClientId: clients[0]?.id ?? null })
  },
  setCompanies: (companies: CompaniesDto[]) => set({ companies }),
  setPreviewClientId: (previewClientId: string) => {
    set((state) => ({
      previewClientId,
      previewClient: state.clients.find((client) => client.id === previewClientId) || null,
    }))
  },
  setPreviewCompanyId: (previewCompanyId: string) => {
    set((state) => ({
      previewCompanyId,
      previewCompany: state.companies.find((company) => company.id === previewCompanyId) || null,
    }))
  },
}))
