interface PreviewPropertyProps {
  label: string
  value?: string
}

export const PreviewProperty = ({ label, value }: PreviewPropertyProps) => {
  return (
    <div className="flex gap-2 text-custom-sm">
      <div className="min-w-[100px] text-fg-secondary">{label}</div>
      <div className="break-all">{value}</div>
    </div>
  )
}
