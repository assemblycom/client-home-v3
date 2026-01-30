import { Popper } from '@editor/components/Popper'
import { useSelector } from '@editor/hooks/useSelector'
import { useUsersStore } from '@users/stores/usersStore'
import { Icon, UserCompanySelector } from 'copilot-design-system'
import { useRef, useState } from 'react'

export const ClientSelector = () => {
  const { selectorClients, selectorCompanies, handleSelectorChange } = useSelector()
  const previewClient = useUsersStore((store) => store.previewClient)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const togglePopper = () => setIsOpen((prev) => !prev)

  return (
    <div>
      <button
        type="button"
        ref={triggerRef}
        onClick={togglePopper}
        className="box-content flex min-h-7 items-center gap-2.5 rounded-sm border border-border-gray px-2 py-0.5 text-[13px] leading-[21px]"
      >
        <div>
          <span className="text-text-secondary">Preview as: </span>
          <span>
            {previewClient?.firstName} {previewClient?.lastName}
          </span>
        </div>
        <Icon icon="ChevronDown" name="arrow-down" height={10} width={10} className="text-text-primary" />
      </button>
      <Popper isOpen={isOpen} setIsOpen={setIsOpen} triggerRef={triggerRef} className="bg-white!">
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
      </Popper>
    </div>
  )
}
