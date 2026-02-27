import { useEditorStore } from '@editor/stores/editorStore'
import type { Editor } from '@tiptap/core'
import type { ActionConfig, ActionData } from 'copilot-design-system'

export type { ActionConfig, ActionData }

export enum EditorActions {
  HEADING1 = 'heading1',
  HEADING2 = 'heading2',
  HEADING3 = 'heading3',
  TEXT = 'text',
  BOLD = 'bold',
  ITALIC = 'italic',
  UNDERLINE = 'underline',
  UNORDERED_LIST = 'unorderedList',
  ORDERED_LIST = 'orderedList',
  AUTOFILL = 'autofillFields',
  TABLE = 'table',
  CALLOUT = 'callout',
  DIVIDER = 'divider',
  CODE = 'code',
  ATTACHMENT = 'attachment',
}

export enum MenuMode {
  TOOLBAR = 'toolbar',
  SLASH_MENU = 'slash-menu',
}

export const editorActionConfig = (mode: MenuMode): ActionConfig[] => {
  const allGroups: ActionConfig[] = [
    {
      id: 'text-styles',
      type: 'group',
      label: 'Text styles',
      actions: [
        {
          type: 'action',
          id: EditorActions.HEADING1,
          action: EditorActions.HEADING1,
          icon: 'H1',
          label: 'Heading 1',
        },
        {
          type: 'action',
          id: EditorActions.HEADING2,
          action: EditorActions.HEADING2,
          icon: 'H2',
          label: 'Heading 2',
        },
        {
          type: 'action',
          id: EditorActions.HEADING3,
          action: EditorActions.HEADING3,
          icon: 'H3',
          label: 'Heading 3',
        },
      ],
    },
    {
      id: 'text-controls',
      type: 'group',
      label: 'Text controls',
      actions: [
        {
          type: 'action',
          id: EditorActions.BOLD,
          action: EditorActions.BOLD,
          icon: 'Bold',
          label: 'Bold',
        },
        {
          type: 'action',
          id: EditorActions.ITALIC,
          action: EditorActions.ITALIC,
          icon: 'Italicize',
          label: 'Italic',
        },
        {
          type: 'action',
          id: EditorActions.UNDERLINE,
          action: EditorActions.UNDERLINE,
          icon: 'Underline',
          label: 'Underline',
        },
      ],
    },
    {
      id: 'list-formatting',
      type: 'group',
      label: 'List formatting',
      actions: [
        {
          type: 'action',
          id: EditorActions.UNORDERED_LIST,
          action: EditorActions.UNORDERED_LIST,
          icon: 'UnorderedList',
          label: 'Bullet List',
        },
        {
          type: 'action',
          id: EditorActions.ORDERED_LIST,
          action: EditorActions.ORDERED_LIST,
          icon: 'NumberedList',
          label: 'Numbered List',
        },
      ],
    },
    {
      id: 'content-blocks',
      type: 'group',
      label: 'Content blocks',
      actions: [
        {
          type: 'action',
          id: EditorActions.AUTOFILL,
          action: EditorActions.AUTOFILL,
          icon: 'BracketsCurly',
          label: 'Autofill fields',
        },
        {
          type: 'action',
          id: EditorActions.TABLE,
          action: EditorActions.TABLE,
          icon: 'Table',
          label: 'Table',
        },
        {
          type: 'action',
          id: EditorActions.CALLOUT,
          action: EditorActions.CALLOUT,
          icon: 'Callout',
          label: 'Callout',
        },
        {
          type: 'action',
          id: EditorActions.DIVIDER,
          action: EditorActions.DIVIDER,
          icon: 'Dash',
          label: 'Divider',
        },
      ],
    },
    {
      id: 'insert-elements',
      type: 'group',
      label: 'Insert Elements',
      actions: [
        {
          type: 'action',
          id: EditorActions.CODE,
          action: EditorActions.CODE,
          icon: 'Code',
          label: 'Code',
        },
        {
          type: 'action',
          id: EditorActions.ATTACHMENT,
          action: EditorActions.ATTACHMENT,
          icon: 'Attachment',
          label: 'Upload',
        },
      ],
    },
  ]

  if (mode === MenuMode.SLASH_MENU) {
    return allGroups.filter((group) => group.id !== 'text-controls')
  }

  return allGroups
}

export const handleToolbarAction = (
  { action }: ActionData,
  editorInstance?: Editor,
  range?: { from: number; to: number },
) => {
  const editor = editorInstance || useEditorStore.getState().editor
  if (!editor) {
    console.warn('Editor not available')
    return
  }
  executeSlashCommand(action, editor, range)
}

export const getActionState = (editor: Editor | null, actionId: string): { isActive: boolean; isDisabled: boolean } => {
  if (!editor) {
    return { isActive: false, isDisabled: true }
  }
  console.info(getIsActive(editor, actionId))
  return {
    isActive: getIsActive(editor, actionId),
    isDisabled: false,
  }
}

const getIsActive = (editor: Editor, actionId: string): boolean => {
  switch (actionId) {
    case EditorActions.HEADING1:
      return editor.isActive('heading', { level: 1 })
    case EditorActions.HEADING2:
      return editor.isActive('heading', { level: 2 })
    case EditorActions.HEADING3:
      return editor.isActive('heading', { level: 3 })
    case EditorActions.BOLD:
      return editor.isActive('bold')
    case EditorActions.ITALIC:
      return editor.isActive('italic')
    case EditorActions.UNDERLINE:
      return editor.isActive('underline')
    case EditorActions.UNORDERED_LIST:
      return editor.isActive('bulletList')
    case EditorActions.ORDERED_LIST:
      return editor.isActive('orderedList')
    case EditorActions.CODE:
      return editor.isActive('codeBlock')
    case EditorActions.CALLOUT:
      return editor.isActive('callout')
    default:
      return false
  }
}

export const executeSlashCommand = (action: string, editor: Editor, range?: { from: number; to: number }) => {
  // Delete the slash command text if range is provided
  if (range) {
    editor.chain().focus().deleteRange(range).run()
  }

  switch (action) {
    case EditorActions.HEADING1:
      editor.chain().focus().toggleHeading({ level: 1 }).run()
      break
    case EditorActions.HEADING2:
      editor.chain().focus().toggleHeading({ level: 2 }).run()
      break
    case EditorActions.HEADING3:
      editor.chain().focus().toggleHeading({ level: 3 }).run()
      break
    case EditorActions.TEXT:
      editor.chain().focus().setParagraph().run()
      break
    case EditorActions.BOLD:
      editor.chain().focus().toggleBold().run()
      break
    case EditorActions.ITALIC:
      editor.chain().focus().toggleItalic().run()
      break
    case EditorActions.UNDERLINE:
      editor.chain().focus().toggleUnderline().run()
      break
    case EditorActions.UNORDERED_LIST:
      editor.chain().focus().toggleBulletList().run()
      break
    case EditorActions.ORDERED_LIST:
      editor.chain().focus().toggleOrderedList().run()
      break
    case EditorActions.AUTOFILL:
      // TODO: Implement in later milestone
      console.info('Toggle handlebars')
      break
    case EditorActions.TABLE:
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      break
    case EditorActions.CALLOUT:
      editor.chain().focus().setCallout().run()
      break
    case EditorActions.DIVIDER:
      editor.chain().focus().setHorizontalRule().run()
      break
    case EditorActions.CODE:
      editor.chain().focus().setCodeBlock().run()
      break
    case EditorActions.ATTACHMENT:
      // TODO: Implement in later milestone
      console.info('Toggle attachment')
      break
    default:
      console.info('Unknown action:', action)
  }
}

export const getAllActionsFromConfig = (config: ActionConfig[]) => {
  return config.flatMap((item) => {
    if (item.type === 'group') {
      return item.actions.filter((action) => action.type === 'action')
    }
    return []
  })
}
