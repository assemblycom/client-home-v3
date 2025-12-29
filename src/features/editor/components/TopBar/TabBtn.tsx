import { cn } from '@/components/utils'

interface TabBtnProps {
  label: string
  active?: boolean
  handleClick: () => void
}

export const TabBtn = ({ label, active, handleClick }: TabBtnProps) => {
  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn('flex px-[6px] py-[2px] text-custom-xs', active && 'bg-background-secondary')}
    >
      {label}
    </button>
  )
}
