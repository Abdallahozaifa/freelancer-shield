import React from 'react';
import { cn } from '../../utils/cn';

interface ProjectHealthGaugeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const getHealthColor = (score: number): { bg: string; text: string; ring: string } => {
  if (score >= 80) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      ring: 'stroke-green-500',
    };
  }
  if (score >= 50) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      ring: 'stroke-yellow-500',
    };
  }
  return {
    bg: 'bg-red-100',
    text: 'text-red-700',
    ring: 'stroke-red-500',
  };
};

const getHealthLabel = (score: number): string => {
  if (score >= 80) return 'Healthy';
  if (score >= 50) return 'At Risk';
  return 'Critical';
};

const sizeConfig = {
  sm: { size: 64, strokeWidth: 4, fontSize: 'text-lg', labelSize: 'text-xs' },
  md: { size: 96, strokeWidth: 6, fontSize: 'text-2xl', labelSize: 'text-sm' },
  lg: { size: 128, strokeWidth: 8, fontSize: 'text-3xl', labelSize: 'text-base' },
};

export const ProjectHealthGauge: React.FC<ProjectHealthGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const colors = getHealthColor(score);
  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={config.size}
          height={config.size}
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="text-gray-200"
          />
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className={cn('transition-all duration-500 ease-out', colors.ring)}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', config.fontSize, colors.text)}>
            {score}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <span className={cn('mt-2 font-medium', config.labelSize, colors.text)}>
          {getHealthLabel(score)}
        </span>
      )}
    </div>
  );
};

// Compact bar version for cards
interface ProjectHealthBarProps {
  score: number;
  className?: string;
}

export const ProjectHealthBar: React.FC<ProjectHealthBarProps> = ({
  score,
  className,
}) => {
  const colors = getHealthColor(score);
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn('text-sm font-medium min-w-[3ch]', colors.text)}>
        {score}
      </span>
    </div>
  );
};
