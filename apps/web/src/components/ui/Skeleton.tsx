import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  className?: string;
}

const SkeletonItem: React.FC<Omit<SkeletonProps, 'count'>> = ({
  width,
  height,
  circle = false,
  className,
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        circle ? 'rounded-full' : 'rounded-md',
        !width && 'w-full',
        !height && 'h-4',
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
};

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  ...props
}) => {
  if (count === 1) {
    return <SkeletonItem {...props} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} {...props} />
      ))}
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="rounded-lg border border-gray-200 p-4 space-y-4">
    <Skeleton height={24} width="60%" />
    <SkeletonText lines={2} />
    <div className="flex gap-2">
      <Skeleton height={32} width={80} />
      <Skeleton height={32} width={80} />
    </div>
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const sizes = { sm: 32, md: 40, lg: 48 };
  return <Skeleton width={sizes[size]} height={sizes[size]} circle />;
};
