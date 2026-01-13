import { cn } from '@/utils/tailwind'

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
      className={cn('flex cursor-pointer px-1.5 py-0.5 text-custom-xs', active && 'bg-background-secondary')}
    >
      {label}
    </button>
  )
}
