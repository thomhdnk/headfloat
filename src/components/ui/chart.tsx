import { cn } from "@/lib/utils"

function Chart({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="text-xs font-medium">Revenue</div>
          <div className="text-2xl font-bold">$1,428.50</div>
        </div>
        <div className="h-[4px] w-full rounded-full bg-secondary">
          <div className="h-full w-1/2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

export { Chart }
