"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Command className={`overflow-visible bg-transparent ${className}`}>
      <div className="group border border-input px-3 py-2 text-sm rounded-md flex items-center flex-wrap gap-1">
        {selected.map((value) => {
          const option = options.find((o) => o.value === value)
          return (
            <Badge key={value} variant="secondary" className="flex items-center gap-1">
              {option?.label}
              <button
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(value)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(value)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
        <CommandPrimitive.Input
          ref={inputRef}
          value={inputValue}
          onValueChange={setInputValue}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
        />
      </div>
      <div className="relative">
        {open && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto max-h-[300px]">
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      handleSelect(option.value)
                      setInputValue("")
                    }}
                  >
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        isSelected ? "bg-primary text-primary-foreground border-primary" : "opacity-50 border-input"
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2">✓</span>}
                    </div>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  )
}
