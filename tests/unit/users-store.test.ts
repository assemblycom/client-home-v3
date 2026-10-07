import { useUsersStore } from '@users/stores/usersStore'
import { beforeEach, describe, expect, it } from 'vitest'

const client = {
  id: '00000000-0000-4000-8000-000000000001',
  firstName: 'Ava',
  email: 'ava@example.com',
  companyId: '00000000-0000-4000-8000-000000000002',
}
const company = { id: client.companyId, name: 'Hessington Oil' }

describe('usersStore preview company', () => {
  beforeEach(() => {
    useUsersStore.setState(useUsersStore.getInitialState())
  })

  it('derives the first client company when clients load before companies', () => {
    useUsersStore.getState().setClients([client])
    useUsersStore.getState().setCompanies([company])

    expect(useUsersStore.getState().previewCompany).toEqual(company)
  })

  it('derives the first client company when companies load before clients', () => {
    useUsersStore.getState().setCompanies([company])
    useUsersStore.getState().setClients([client])

    expect(useUsersStore.getState().previewCompany).toEqual(company)
  })
})
