import Image from '@tiptap/extension-image'

export const ImageExt = Image.configure({
  resize: {
    enabled: true,
    alwaysPreserveAspectRatio: true,
    minHeight: 50,
    minWidth: 50,
  },
  allowBase64: true,
})
