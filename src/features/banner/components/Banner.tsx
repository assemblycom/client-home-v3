import { Icon } from '@assembly-js/design-system'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/tailwind'
import { BannerSkeleton } from './BannerSkeleton'

interface BannerProps {
  src: string
  alt?: string
  isSelected?: boolean
  className?: string
  editable?: boolean
  positionX?: number
  positionY?: number
  isRepositioning?: boolean
  onRepositioningChange?: (repositioning: boolean) => void
  onChangeBanner?: () => void
  onSavePosition?: (positionX: number, positionY: number) => void
}

export const Banner = ({
  src,
  alt,
  isSelected,
  className,
  editable,
  positionX = 50,
  positionY = 50,
  isRepositioning: externalRepositioning,
  onRepositioningChange,
  onChangeBanner,
  onSavePosition,
}: BannerProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [internalRepositioning, setInternalRepositioning] = useState(false)

  const isRepositioning = externalRepositioning !== undefined ? externalRepositioning : internalRepositioning
  const setIsRepositioning = useCallback(
    (value: boolean) => {
      onRepositioningChange?.(value)
      setInternalRepositioning(value)
    },
    [onRepositioningChange],
  )
  const [showControls, setShowControls] = useState(false)
  const [currentX, setCurrentX] = useState(positionX)
  const [currentY, setCurrentY] = useState(positionY)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragStartPosition, setDragStartPosition] = useState({ x: positionX, y: positionY })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentX(positionX)
    setCurrentY(positionY)
  }, [positionX, positionY])

  // Dismiss controls when tapping outside the banner
  useEffect(() => {
    if (!showControls) return
    const handleClickOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowControls(false)
      }
    }
    window.addEventListener('pointerdown', handleClickOutside)
    return () => window.removeEventListener('pointerdown', handleClickOutside)
  }, [showControls])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isRepositioning) return
      e.preventDefault()
      setDragStart({ x: e.clientX, y: e.clientY })
      setDragStartPosition({ x: currentX, y: currentY })
    },
    [isRepositioning, currentX, currentY],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isRepositioning) {
        if (editable) {
          e.preventDefault()
          setShowControls((prev) => !prev)
        }
        return
      }
      const touch = e.touches[0]
      setDragStart({ x: touch.clientX, y: touch.clientY })
      setDragStartPosition({ x: currentX, y: currentY })
    },
    [isRepositioning, editable, currentX, currentY],
  )

  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragStart || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const sensitivityX = 50 / rect.width
      const sensitivityY = 50 / rect.height

      const deltaX = -(clientX - dragStart.x) * sensitivityX
      const deltaY = -(clientY - dragStart.y) * sensitivityY

      setCurrentX(Math.max(0, Math.min(100, dragStartPosition.x + deltaX)))
      setCurrentY(Math.max(0, Math.min(100, dragStartPosition.y + deltaY)))
    },
    [dragStart, dragStartPosition],
  )

  const endDrag = useCallback(() => {
    setDragStart(null)
  }, [])

  useEffect(() => {
    if (dragStart !== null) {
      const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY)
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        moveDrag(e.touches[0].clientX, e.touches[0].clientY)
      }

      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', endDrag)
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', endDrag)
      return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', endDrag)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', endDrag)
      }
    }
  }, [dragStart, moveDrag, endDrag])

  const handleSave = () => {
    onSavePosition?.(Math.round(currentX), Math.round(currentY))
    setIsRepositioning(false)
  }

  const handleCancel = () => {
    setCurrentX(positionX)
    setCurrentY(positionY)
    setIsRepositioning(false)
  }

  if (hasError) return null

  const controlsVisible = showControls

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative aspect-[3/1] w-full shrink-0 overflow-hidden rounded-lg sm:aspect-[4/1] lg:aspect-[5/1]',
        className,
      )}
    >
      <Image
        src={src}
        alt={alt ?? ''}
        fill
        className={cn('object-cover', isRepositioning && 'cursor-grab active:cursor-grabbing')}
        style={{ objectPosition: `${currentX}% ${currentY}%` }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        priority
        unoptimized
        draggable={false}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />

      {!isLoaded && <BannerSkeleton />}

      {/* Grid background while repositioning: */}
      {isRepositioning && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/10" />
        </>
      )}

      {isSelected && (
        <div className="absolute top-2.5 right-2.5 z-10 flex h-6 w-6 flex-shrink-0 flex-col items-end rounded-full bg-white p-1 pb-0">
          <Icon icon="Check" width={16} height={16} />
        </div>
      )}

      {isRepositioning && (
        <>
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
            <button
              type="button"
              onClick={handleSave}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-gray bg-white py-[3px] pr-2 pl-2 font-medium text-text-primary text-xs shadow-sm hover:bg-gray-50"
            >
              <Icon icon="Check" width={14} height={14} />
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-gray bg-white py-[3px] pr-2 pl-2 font-medium text-text-primary text-xs shadow-sm hover:bg-gray-50"
            >
              <Icon icon="Close" width={14} height={14} />
              Cancel
            </button>
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 font-medium text-text-primary text-xs shadow-sm">
              <Icon icon="Reposition" width={16} height={16} />
              Drag image to reposition
            </div>
          </div>
        </>
      )}

      {/* Normal mode: */}
      {editable && !isRepositioning && (
        <div
          className={cn(
            'absolute top-2.5 right-2.5 z-10 flex items-center gap-1 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100',
            controlsVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <button
            type="button"
            onClick={onChangeBanner}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-gray bg-white py-[3px] pr-2 pl-2 font-medium text-text-primary text-xs shadow-sm hover:bg-gray-50"
          >
            <Icon icon="Edit" width={14} height={14} />
            Change
          </button>
          <button
            type="button"
            onClick={() => setIsRepositioning(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-gray bg-white py-[3px] pr-2 pl-2 font-medium text-text-primary text-xs shadow-sm hover:bg-gray-50"
          >
            <Icon icon="Reposition" width={14} height={14} />
            Reposition
          </button>
        </div>
      )}
    </div>
  )
}
