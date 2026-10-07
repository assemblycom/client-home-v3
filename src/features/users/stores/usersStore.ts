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

const findCompany = (companies: CompaniesDto[], companyId?: string | null) =>
  companies.find((company) => company.id === companyId) ?? null

export const useUsersStore = create<UsersState & UsersActions>()((set) => ({
  ...initialState,
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
  setClients: (clients: ClientsDto[]) => {
    const previewClient = clients[0] ?? null
    set((state) => ({
      clients,
      previewClient,
      previewClientId: previewClient?.id ?? null,
      previewCompanyId: previewClient?.companyId ?? null,
      previewCompany: findCompany(state.companies, previewClient?.companyId),
    }))
  },
  setCompanies: (companies: CompaniesDto[]) =>
    set((state) => ({ companies, previewCompany: findCompany(companies, state.previewCompanyId) })),
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
