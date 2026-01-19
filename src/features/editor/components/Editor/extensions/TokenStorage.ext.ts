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
          // @ts-expect-error no string typing for storage for now
          editor.storage.token.token = token
          return true
        },

      getToken:
        () =>
        ({ editor }: { editor: Editor }) => {
          // @ts-expect-error no string typing for storage for now
          return editor.storage.token.token
        },
    }
  },
})
