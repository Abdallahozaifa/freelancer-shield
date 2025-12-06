import React from 'react';
import { CheckCircle2, Clock, Target, PieChart, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui';
import { cn } from '../../../utils/cn';

export interface ScopeProgressData {
  total_items: number;
  completed_items: number;
  completion_percentage: number;
  total_estimated_hours: number | null;
  completed_estimated_hours: number | null;
}

interface ScopeProgressCardProps {
  progress: ScopeProgressData;
  className?: string;
}

const formatHours = (hours: number | null): string => {
  if (hours === null || hours === undefined) return '0';
  const num = Number(hours);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
};

export const ScopeProgressCard: React.FC<ScopeProgressCardProps> = ({
  progress,
  className,
}) => {
  const {
    total_items,
    completed_items,
    completion_percentage,
    total_estimated_hours,
    completed_estimated_hours,
  } = progress;

  const hasHours = total_estimated_hours !== null && Number(total_estimated_hours) > 0;
  
  // Calculate hours percentage safely
  const hoursPercentage = hasHours 
    ? Math.min(Math.round((Number(completed_estimated_hours) / Number(total_estimated_hours)) * 100), 100)
    : 0;

  return (
    <Card className={cn('overflow-hidden border-slate-200 shadow-sm', className)}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Section 1: Deliverable Progress */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                  <Target className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700">Deliverables</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{completion_percentage}%</span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out shadow-sm',
                  completion_percentage === 100 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                )}
                style={{ width: `${completion_percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Completed</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{completed_items}</span>
                <span className="text-xs text-slate-400 ml-1">items</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <PieChart className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Remaining</span>
                </div>
                <span className="text-lg font-bold text-slate-800">{total_items - completed_items}</span>
                <span className="text-xs text-slate-400 ml-1">items</span>
              </div>
            </div>
          </div>

          {/* Vertical Divider (Desktop only) */}
          <div className="hidden md:block w-px bg-slate-100 mx-2" />

          {/* Section 2: Time Tracking (Conditional) */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700">Time Estimates</span>
              </div>
              {hasHours && (
                <span className="text-2xl font-bold text-slate-900">{hoursPercentage}%</span>
              )}
            </div>

            {hasHours ? (
              <>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${hoursPercentage}%` }}
                  />
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-0.5">Estimated Time</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatHours(completed_estimated_hours)}
                      <span className="text-slate-400 font-normal text-sm ml-1">
                        / {formatHours(total_estimated_hours)} hrs
                      </span>
                    </span>
                  </div>
                  {Number(completed_estimated_hours) > Number(total_estimated_hours) && (
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">Over Budget</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <Clock className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-500">No time estimates added</p>
                <p className="text-xs text-slate-400 mt-1">Add hours to items to track time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};