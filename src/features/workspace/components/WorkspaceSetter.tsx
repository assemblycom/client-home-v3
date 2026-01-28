'use client'

import { useViewStore } from '@editor/stores/viewStore'
import { useEffect } from 'react'
import type { WorkspaceResponse } from '@/lib/assembly/types'

interface WorkspaceSetterProps {
  workspace: WorkspaceResponse
}

export const WorkspaceSetter = ({ workspace }: WorkspaceSetterProps) => {
  const setWorkspace = useViewStore((state) => state.setWorkspace)

  useEffect(() => {
    setWorkspace(workspace)
  }, [workspace, setWorkspace])

  return null
}
