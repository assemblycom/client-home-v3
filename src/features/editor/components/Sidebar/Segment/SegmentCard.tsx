import { IconButton } from 'copilot-design-system'

// UI slicing with static dummy data

export const SegmentCard = () => {
  return (
    <div className="rounded-sm border border-border-gray p-3">
      <div className="flex items-center justify-between">
        <div className="text-text-secondary text-xs uppercase leading-5">Default</div>
        <IconButton icon="Ellipsis" variant="minimal" />
      </div>
      <div className="mt-1 mb-4.5 font-medium text-xl leading-7">132 clients</div>
      <div className="mb-2">
        <div className="mb-2 h-1.5 border border-[#649EAF] border-b-0"></div>
        <div className="h-4 bg-[#649EAF]"></div>
      </div>
      <div className="float-end text-[10px] uppercase leading-3 tracking-[1px]">total 132</div>
    </div>
  )
}
