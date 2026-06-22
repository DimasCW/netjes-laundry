"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronDown, X } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ServiceData, TransactionFilters, STATUS_LABELS } from "@/types"
import { StatusProses } from "@prisma/client"

interface TransactionFiltersAreaProps {
  filters: TransactionFilters
  services: ServiceData[]
  onFilterChange: (newParams: Record<string, string | number | null>) => void
}

export function TransactionFiltersArea({
  filters,
  services,
  onFilterChange,
}: TransactionFiltersAreaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-dashed">
      {/* Status Filter */}
      <Select
        value={filters.status || "ALL"}
        onValueChange={(val) => onFilterChange({ status: val === "ALL" ? null : val })}
      >
        <SelectTrigger className="w-[160px] h-9 bg-background">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Status</SelectItem>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Service Filter */}
      <Select
        value={filters.serviceId || "ALL"}
        onValueChange={(val) => onFilterChange({ serviceId: val === "ALL" ? null : val })}
      >
        <SelectTrigger className="w-[180px] h-9 bg-background">
          <SelectValue placeholder="Semua Layanan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Layanan</SelectItem>
          {services.map((service) => (
            <SelectItem key={service.id} value={String(service.id)}>
              {service.namaLayanan}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] h-9 justify-start text-left font-normal bg-background",
              !filters.dateFrom && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom ? (
              format(new Date(filters.dateFrom), "dd MMM yyyy", { locale: id })
            ) : (
              <span>Dari Tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            onSelect={(date) => onFilterChange({ dateFrom: date ? date.toISOString() : null })}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date To Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] h-9 justify-start text-left font-normal bg-background",
              !filters.dateTo && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateTo ? (
              format(new Date(filters.dateTo), "dd MMM yyyy", { locale: id })
            ) : (
              <span>Sampai Tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
            onSelect={(date) => onFilterChange({ dateTo: date ? date.toISOString() : null })}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      <div className="flex flex-wrap gap-2 items-center ml-2">
        {filters.status && filters.status !== "ALL" && (
          <Badge variant="secondary" className="gap-1 pr-1 font-normal">
            Status: {STATUS_LABELS[filters.status as StatusProses]}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 rounded-full p-0 hover:bg-muted"
              onClick={() => onFilterChange({ status: null })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.serviceId && filters.serviceId !== "ALL" && (
          <Badge variant="secondary" className="gap-1 pr-1 font-normal">
            Layanan: {services.find(s => String(s.id) === filters.serviceId)?.namaLayanan}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 rounded-full p-0 hover:bg-muted"
              onClick={() => onFilterChange({ serviceId: null })}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>
    </div>
  )
}
