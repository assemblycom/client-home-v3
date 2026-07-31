import { Icon } from '@assembly-js/design-system'
import { getDashboardOrigin } from '@/utils/urls'

export const EmptyClientPreview = () => {
  const handleAddClients = () => {
    const dashboardOrigin = getDashboardOrigin()
    if (dashboardOrigin) {
      window.open(`${dashboardOrigin}/clients/users`, '_top')
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-10">
      <div className="flex flex-col items-start text-left">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
          <Icon icon="Profile" width={24} height={24} />
        </div>
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="font-medium text-[17px] text-text-primary">No clients to preview</h2>
          <p className="text-sm text-text-secondary">Add a client to generate a preview of your portal.</p>
        </div>
        <button
          type="button"
          onClick={handleAddClients}
          className="flex items-center gap-1.5 rounded-md bg-[#1F2937] px-3 py-1.5 font-medium text-[13px] text-white hover:bg-gray-800"
        >
          <Icon icon="Plus" width={14} height={14} />
          Add clients
        </button>
      </div>
    </div>
  )
}
