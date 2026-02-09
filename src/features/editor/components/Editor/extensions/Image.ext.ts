import Image from '@tiptap/extension-image'

export const ImageExt = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {}
          }
          return {
            height: attributes.height,
          }
        },
      },
    }
  },
}).configure({
  resize: {
    enabled: true,
    alwaysPreserveAspectRatio: true,
    minHeight: 50,
    minWidth: 50,
  },
  allowBase64: true,
})
