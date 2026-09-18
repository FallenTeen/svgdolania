'use client'

export function CheckboxGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value.includes(option.value)
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                checked
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                className="h-3.5 w-3.5 accent-emerald-600"
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </div>
  )
}