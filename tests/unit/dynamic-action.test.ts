import type { ActionableInstallDto } from '@installed-apps/installed-apps.dto'
import { capitalizeVerb, toDynamicActionDefinition } from '@installed-apps/lib/dynamic-action'
import { describe, expect, it } from 'vitest'

const createActionableInstall = (verb: string): ActionableInstallDto => ({
  installId: 'install_1',
  appId: 'app_1',
  displayName: 'Docs',
  icon: 'CustomApps',
  actionLabel: { verb, singularNoun: 'document', pluralNoun: 'documents' },
})

describe('capitalizeVerb', () => {
  it('capitalizes a lowercase verb', () => {
    expect(capitalizeVerb('review')).toBe('Review')
  })

  it('normalizes inconsistent inner casing', () => {
    expect(capitalizeVerb('reView')).toBe('Review')
  })

  it('normalizes an all-caps verb', () => {
    expect(capitalizeVerb('REVIEW')).toBe('Review')
  })

  it('leaves an already-capitalized verb unchanged', () => {
    expect(capitalizeVerb('Review')).toBe('Review')
  })

  it('capitalizes only the first word of a multi-word verb', () => {
    expect(capitalizeVerb('sign off')).toBe('Sign off')
  })

  it('trims surrounding whitespace', () => {
    expect(capitalizeVerb('  review  ')).toBe('Review')
  })

  it('returns an empty string for an empty verb', () => {
    expect(capitalizeVerb('   ')).toBe('')
  })
})

describe('toDynamicActionDefinition', () => {
  it('capitalizes the verb and passes the nouns through verbatim', () => {
    const action = toDynamicActionDefinition(createActionableInstall('reView'))

    expect(action.verb).toBe('Review')
    expect(action.label).toBe('documents')
    expect(action.singularLabel).toBe('document')
  })
})
