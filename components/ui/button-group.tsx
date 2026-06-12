import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ButtonGroup({ className, ...props }: ButtonGroupProps) {
  return (
    <div
      className={cn("flex items-center -space-x-px", className)}
      {...props}
    />
  )
}
