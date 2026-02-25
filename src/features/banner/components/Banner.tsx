import { Icon } from 'copilot-design-system'
import Image from 'next/image'
import { cn } from '@/utils/tailwind'

interface BannerProps {
  src: string
  alt: string
  isSelected?: boolean
  className?: string
}

export const Banner = ({ src, alt, isSelected, className }: BannerProps) => {
  return (
    <div className={cn('relative aspect-[5/1] w-full overflow-hidden rounded-lg', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        priority
      />
      {isSelected && (
        <div
          className="absolute top-2.5 right-2.5 z-10 flex h-6 w-6 flex-shrink-0 flex-col items-end rounded-full bg-white"
          style={{ padding: '4px 4px 0 4px' }}
        >
          <Icon icon="Check" width={16} height={16} />
        </div>
      )}
    </div>
  )
}
