import * as React from "react"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={`animate-pulse rounded-md bg-primary/10 ${className ?? ""}`}
      {...props}
    />
  )
}

export { Skeleton }
