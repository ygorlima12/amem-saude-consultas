import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  trend?: {
    value: string
    isUp: boolean
  }
}

export const StatCard = ({ title, value, icon: Icon, iconColor = 'primary', trend }: StatCardProps) => {
  return (
    <div className="bg-white rounded-card p-6 shadow-card-md transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover relative overflow-hidden group">
      {/* Gradient border on left */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-stat-border" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div
            className={cn(
              'w-[50px] h-[50px] rounded-xl flex items-center justify-center text-[22px]',
              {
                'bg-primary/10 text-primary': iconColor === 'primary',
                'bg-secondary/10 text-secondary': iconColor === 'secondary',
                'bg-success-500/10 text-success-500': iconColor === 'success',
                'bg-warning-500/10 text-warning-500': iconColor === 'warning',
                'bg-danger-500/10 text-danger-500': iconColor === 'danger',
              }
            )}
          >
            <Icon size={24} />
          </div>
        </div>
      </div>

      <div className="mb-1">
        <div className="text-[32px] font-bold text-secondary-900 leading-none">
          {value}
        </div>
      </div>

      <div className="text-text-light text-sm font-medium">
        {title}
      </div>

      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-[13px] mt-2.5',
          trend.isUp ? 'text-success-500' : 'text-danger-500'
        )}>
          <span>{trend.isUp ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  )
}
