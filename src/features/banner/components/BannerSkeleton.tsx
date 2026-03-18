import { Spinner } from '@assembly-js/design-system'

export const BannerSkeleton = () => {
  return (
    <div className="absolute inset-0 z-10 bg-gray-200">
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size={5} />
      </div>
    </div>
  )
}
