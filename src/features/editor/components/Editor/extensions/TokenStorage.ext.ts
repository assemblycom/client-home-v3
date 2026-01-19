import { type Editor, Extension } from '@tiptap/core'

export type TokenExtensionOptions = {
  token: string | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    token: {
      setToken: (token: string | null) => ReturnType
      getToken: () => string | null
    }
  }
  interface Storage {
    token: {
      token: string | null
    }
  }
}

export const TokenStorageExt = Extension.create<TokenExtensionOptions>({
  name: 'token',

  addOptions() {
    return {
      token: null,
    }
  },

  addStorage() {
    return {
      token: this.options.token as string | null,
    }
  },

  // @ts-expect-error Will fix this typing later
  addCommands() {
    return {
      setToken:
        (token) =>
        ({ editor }) => {
          editor.storage.token.token = token
          return true
        },

      getToken:
        () =>
        ({ editor }: { editor: Editor }) => {
          return editor.storage.token.token
        },
    }
  },
})
