import { cn } from '@/utils/tailwind'

export const ResizeBar = (props: React.ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cn(
        'resize-bar top-1/4', // 1/4 accounts for Parent + div heights. This positions it at 1/2 of parent
        props.className,
      )}
    />
  )
}
