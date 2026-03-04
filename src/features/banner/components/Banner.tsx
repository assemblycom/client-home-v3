import { Icon } from 'copilot-design-system'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { cn } from '@/utils/tailwind'

interface BannerProps {
  src: string
  alt?: string
  isSelected?: boolean
  className?: string
  showSkeleton?: boolean
  onImageLoad?: () => void
}

const shimmerStyle = {
  backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
  backgroundSize: '200% 100%',
  animation: 'banner-shimmer 1.2s ease-in-out infinite',
} as const

const ShimmerKeyframes = () => (
  <style>{`@keyframes banner-shimmer { 0%, 100% { background-position: 200% 0; } 50% { background-position: 0% 0; } }`}</style>
)

export const BannerSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('relative aspect-[5/1] w-full overflow-hidden rounded-lg', className)}>
      <ShimmerKeyframes />
      <div className="absolute inset-0 rounded-lg" style={shimmerStyle} />
    </div>
  )
}

export const Banner = ({ src, alt, isSelected, className, showSkeleton, onImageLoad }: BannerProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onImageLoad?.()
  }, [onImageLoad])

  const handleRef = useCallback(
    (el: HTMLImageElement | null) => {
      imgRef.current = el
      if (el?.complete && el.naturalWidth > 0) {
        handleLoad()
      }
    },
    [handleLoad],
  )

  const showPlaceholder = showSkeleton ?? !isLoaded

  return (
    <div className={cn('relative aspect-[5/1] w-full overflow-hidden rounded-lg', className)}>
      {showPlaceholder && (
        <>
          <ShimmerKeyframes />
          <div className="absolute inset-0 rounded-lg" style={shimmerStyle} />
        </>
      )}
      <Image
        ref={handleRef}
        src={src}
        alt={alt ?? ''}
        fill
        className={cn('object-cover', showPlaceholder ? 'invisible' : 'visible')}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        priority
        unoptimized //since the src is using token which is dynamic, nextjs cannot optimize it.
        onLoad={handleLoad}
      />
      {isSelected && !showPlaceholder && (
        <div className="absolute top-2.5 right-2.5 z-10 flex h-6 w-6 flex-shrink-0 flex-col items-end rounded-full bg-white p-1 pb-0">
          <Icon icon="Check" width={16} height={16} />
        </div>
      )}
    </div>
  )
}
