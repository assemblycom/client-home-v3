import type { ClientsDto, CompaniesDto } from '@users/users.dto'
import { create } from 'zustand'

interface UsersState {
  previewClientId: string | null
  previewCompanyId: string | null
  clients: ClientsDto[]
  companies: CompaniesDto[]
  previewClient: ClientsDto | null
  previewCompany: CompaniesDto | null
}

interface UsersActions {
  setClients: (clients: ClientsDto[]) => void
  setCompanies: (companies: CompaniesDto[]) => void
  setPreviewClientId: (clientId: string) => void
  setPreviewCompanyId: (companyId: string) => void
}

const initialState: UsersState = {
  clients: [],
  companies: [],
  previewClientId: null,
  previewCompanyId: null,
  previewClient: null,
  previewCompany: null,
}

export const useUsersStore = create<UsersState & UsersActions>()((set) => ({
  ...initialState,
  setClients: (clients: ClientsDto[]) => {
    set({ clients, previewClient: clients[0], previewClientId: clients[0].id })
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
