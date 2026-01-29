import type { ClientsDto, CompaniesDto } from '@users/users.dto'
import { create } from 'zustand'

interface UsersState {
  previewClientId: string | null
  previewCompanyId: string | null
  clients: ClientsDto[]
  companies: CompaniesDto[]
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
}

export const useUsersStore = create<UsersState & UsersActions>()((set) => ({
  ...initialState,
  setClients: (clients: ClientsDto[]) => set({ clients }),
  setCompanies: (companies: CompaniesDto[]) => set({ companies }),
  setPreviewClientId: (clientId: string) => set({ previewClientId: clientId }),
  setPreviewCompanyId: (companyId: string) => set({ previewCompanyId: companyId }),
}))
