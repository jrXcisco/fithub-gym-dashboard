import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  stepsWithErrors?: number[];
}

export function Stepper({ steps, currentStep, onStepClick, stepsWithErrors = [] }: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'relative',
              index !== steps.length - 1 ? 'pr-8 sm:pr-20 flex-1' : ''
            )}
          >
            <div className="flex items-center">
              <button
                onClick={() => onStepClick?.(step.id)}
                disabled={!onStepClick}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                  stepsWithErrors.includes(step.id)
                    ? 'bg-red-500 hover:bg-red-600'
                    : currentStep > step.id
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : currentStep === step.id
                    ? 'bg-primary-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5 text-white" />
                ) : (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      currentStep === step.id ? 'text-white' : 'text-gray-600'
                    )}
                  >
                    {step.id}
                  </span>
                )}
              </button>
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-10 -ml-px h-0.5 w-full',
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  )}
                  style={{ width: 'calc(100% - 2.5rem)' }}
                />
              )}
            </div>
            <div className="mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  stepsWithErrors.includes(step.id)
                    ? 'text-red-500'
                    : currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
