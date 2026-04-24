/**
 * Shared mock utilities for service-layer unit tests.
 */
import { vi } from 'vitest'

/** Creates a mock repository with setTx/unsetTx stubs and any method overrides */
// biome-ignore lint/suspicious/noExplicitAny: test utility for creating mock repositories
export const mockRepo = <T>(overrides: Partial<T> = {} as any) =>
  ({ setTx: vi.fn(), unsetTx: vi.fn(), ...overrides }) as unknown as T

/** Mock AssemblyClient — call resetAssemblyMocks() in beforeEach */
export const mockAssembly = {
  listCustomFields: vi.fn(),
  getAllClients: vi.fn(),
  getCompanies: vi.fn(),
}

export const resetAssemblyMocks = () => {
  mockAssembly.listCustomFields.mockReset()
  mockAssembly.getAllClients.mockReset()
  mockAssembly.getCompanies.mockReset()
}
