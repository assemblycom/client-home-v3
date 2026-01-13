import { cn } from '@/utils/tailwind'

export const ResizeBar = (props: React.ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cn(
        'absolute top-1/4 right-[-4px] min-h-[50%] min-w-2 -translate-y-1/2 transform cursor-nwse-resize rounded border border-gray-200 bg-text-placeholder',
        props.className,
      )}
    />
  )
}
