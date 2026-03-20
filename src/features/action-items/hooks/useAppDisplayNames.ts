import { useViewStore } from '@editor/stores/viewStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/core/axios.instance'

export const useAppDisplayNames = () => {
  const setAppDisplayNames = useViewStore((store) => store.setAppDisplayNames)

  return useQuery({
    queryKey: ['app-display-names'],
    queryFn: async (): Promise<Record<string, string>> => {
      const res = await api.get<{ data: Record<string, string> }>('/api/workspace/app-display-names')
      setAppDisplayNames(res.data.data)
      return res.data.data
    },
    refetchInterval: 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}
