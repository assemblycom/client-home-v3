import StarterKit from '@tiptap/starter-kit'

export const StarterKitExt = StarterKit.configure({
  heading: {
    levels: [1, 2],
  },
  bulletList: {
    HTMLAttributes: { class: 'list-disc' },
    keepMarks: true,
    keepAttributes: true,
  },
  orderedList: {
    itemTypeName: 'listItem',
    keepMarks: true,
    keepAttributes: true,
    HTMLAttributes: {
      class: 'list-decimal',
      type: '1',
    },
  },
})
