import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: string;
  name: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
}

export default function StepIndicator({
  steps,
  currentStepId,
  onStepClick,
}: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isComplete = stepIdx < currentIndex;
          const isCurrent = step.id === currentStepId;

          return (
            <li
              key={step.id}
              className={`${stepIdx !== steps.length - 1 ? 'flex-1' : ''} relative`}
            >
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute left-0 top-4 -right-4 h-0.5 bg-gray-200"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-all duration-300 ${
                      isComplete ? 'bg-blue-600 w-full' : 'bg-gray-200 w-0'
                    }`}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => isComplete && onStepClick?.(step.id)}
                disabled={!isComplete}
                className={`group relative flex flex-col items-center ${
                  isComplete ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    isComplete
                      ? 'bg-blue-600 group-hover:bg-blue-800'
                      : isCurrent
                        ? 'border-2 border-blue-600 bg-white'
                        : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {isComplete ? (
                    <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </span>
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                    isCurrent
                      ? 'text-blue-600'
                      : isComplete
                        ? 'text-gray-900'
                        : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
