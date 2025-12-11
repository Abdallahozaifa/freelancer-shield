import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../api/client';
import { Loading } from '../../components/ui';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to ScopeGuard',
    description: 'Protect your freelance projects from scope creep and manage client expectations effectively.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Add Your Clients',
    description: 'Start by adding your clients. You can track projects, scope items, and client requests for each one.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Define Your Project Scope',
    description: 'Create projects and define clear scope items. This helps track what\'s included and what\'s extra work.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Track Client Requests',
    description: 'When clients ask for changes, log them as requests. ScopeGuard helps you identify what\'s in scope vs. out of scope.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    id: 5,
    title: 'Create Change Order Proposals',
    description: 'For out-of-scope work, create professional proposals to get paid fairly for additional work.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await apiClient.patch('/users/complete-onboarding');
      updateUser({ has_completed_onboarding: true });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsCompleting(false);
    }
  };

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Progress indicator */}
      <div className="relative z-10 w-full max-w-xl mb-8">
        <div className="flex justify-between items-center mb-2">
          {STEPS.map((s, index) => (
            <div
              key={s.id}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                index === currentStep
                  ? 'bg-blue-500 text-white scale-110'
                  : index < currentStep
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.id
              )}
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content card */}
      <div className="relative z-10 w-full max-w-xl">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Step content - fixed height to prevent size changes */}
          <div className="p-8 md:p-12 text-center min-h-[350px] flex flex-col">
            {/* Icon */}
            <div className="mb-6 text-blue-400 flex justify-center">
              <div className="p-4 bg-blue-500/10 rounded-2xl">
                {step.icon}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {step.title}
            </h1>

            {/* Description - flex-1 to fill remaining space, centered */}
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                {step.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-slate-900/50 border-t border-slate-700/50 flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              >
                {isCompleting ? (
                  <>
                    <Loading size="sm" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        <div className="mt-6 text-center">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Skip onboarding
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
