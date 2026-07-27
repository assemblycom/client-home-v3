import type { IconType } from '@assembly-js/design-system'
import type { ActionDefinition } from '@editor/components/Sidebar/Actions/constant'
import type { ActionableInstallDto } from '@installed-apps/installed-apps.dto'
import { isIconType } from '@installed-apps/lib/icon-names'

// Stands in when an install's `icon` is absent or not a design-system IconType.
const FALLBACK_ICON: IconType = 'CustomApps'

// A "Your Actions" row synthesized at runtime from an actionable Studio app install.
// Mirrors ActionDefinition's presentational fields so ActionItem renders it identically,
// but is identified by its install/app rather than a built-in ActionKey.
export type DynamicActionDefinition = {
  verb: string
  /** Plural noun, e.g. "documents". */
  label: string
  /** Singular noun, e.g. "document". */
  singularLabel: string
  icon: IconType
  installId: string
  appId: string
}

// The union ActionItem / ActionsCard render: built-in rows and dynamic Studio-app rows.
export type RenderableAction = ActionDefinition | DynamicActionDefinition

export const isDynamicAction = (action: RenderableAction): action is DynamicActionDefinition => 'installId' in action

export const toDynamicActionDefinition = (install: ActionableInstallDto): DynamicActionDefinition => ({
  verb: install.actionLabel.verb,
  label: install.actionLabel.pluralNoun,
  singularLabel: install.actionLabel.singularNoun,
  icon: isIconType(install.icon) ? install.icon : FALLBACK_ICON,
  installId: install.installId,
  appId: install.appId,
})
