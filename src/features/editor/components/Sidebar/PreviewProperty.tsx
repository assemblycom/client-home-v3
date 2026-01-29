interface PreviewPropertyProps {
  label: string
  value?: string
}

export const PreviewProperty = ({ label, value }: PreviewPropertyProps) => {
  if (!value) return null
  return (
    <div className="flex gap-2 text-custom-sm">
      <div className="min-w-[100px] text-text-secondary">{label}</div>
      <div className="break-all">{value}</div>
    </div>
  )
}
