import { Loader } from '@common/components/Loader'
import { EditorSection } from '@editor/components/EditorSection'
import { Sidebar } from '@editor/components/Sidebar'
import { TopBar } from '@editor/components/TopBar'
import { Suspense } from 'react'

export default function Home() {
  return (
    <div className="flex h-screen w-screen">
      <div className="flex-1">
        <TopBar />
        <div className="h-[calc(100vh-64px)] overflow-y-scroll bg-background-primary px-6 py-6.5">
          <Suspense fallback={<Loader />}>
            <EditorSection />
          </Suspense>
        </div>
      </div>
      <Sidebar className="w-1/3 max-w-[394]" />
    </div>
  )
}
