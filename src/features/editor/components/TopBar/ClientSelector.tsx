import { Icon, UserCompanySelector } from '@assembly-js/design-system'
import { Popper } from '@editor/components/Popper'
import { useSelector } from '@editor/hooks/useSelector'
import { useUsersStore } from '@users/stores/usersStore'
import { useEffect, useRef, useState } from 'react'

export const ClientSelector = () => {
  const { selectorClients, selectorCompanies, handleSelectorChange } = useSelector()
  const previewClient = useUsersStore((store) => store.previewClient)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selectorRef = useRef<HTMLDivElement>(null)
  const togglePopper = () => setIsOpen((prev) => !prev)

  useEffect(() => {
    if (isOpen) {
      // Wait a frame for the portal to mount, then focus the react-select input
      requestAnimationFrame(() => {
        const input = selectorRef.current?.querySelector<HTMLInputElement>('input')
        input?.focus()
      })
    }
  }, [isOpen])

  if (!previewClient) {
    return (
      <div className="box-content flex min-h-7 max-w-48 items-center gap-2.5 rounded-sm border border-border-gray px-2 py-0.5">
        <div className="flex items-center gap-1.5">
          <span className="hidden min-[860px]:inline">
            <div className="h-3.5 w-16 animate-pulse rounded bg-gray-200" />
          </span>
          <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        ref={triggerRef}
        onClick={togglePopper}
        className="box-content flex min-h-7 max-w-48 items-center gap-2.5 whitespace-nowrap rounded-sm border border-border-gray px-2 py-0.5 text-[13px] leading-[21px]"
      >
        <div className="truncate">
          <span className="hidden text-text-secondary min-[860px]:inline">Preview as: </span>
          <span>
            {previewClient?.firstName} {previewClient?.lastName}
          </span>
        </div>
        <Icon icon="ChevronDown" name="arrow-down" height={10} width={10} className="text-text-primary" />
      </button>
      <Popper isOpen={isOpen} setIsOpen={setIsOpen} triggerRef={triggerRef} className="bg-white!">
        <div ref={selectorRef} className="w-76">
          <UserCompanySelector
            menuIsOpen={true}
            name="active-user"
            className="topbar-selector bg-white!"
            clientUsers={selectorClients}
            companies={selectorCompanies}
            placeholder="Search"
            onChange={handleSelectorChange}
            limitSelectedOptions={1}
            closeMenuOnSelect
          />
        </div>
      </Popper>
    </div>
  )
}
