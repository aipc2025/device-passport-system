import { useRegistrationStore } from '../../../store/registration.store';
import { ExpertType } from '@device-passport/shared';
import { WrenchScrewdriverIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

export default function ExpertTypeStep() {
  const { expertData, updateExpertData } = useRegistrationStore();

  const expertTypes = [
    {
      type: ExpertType.TECHNICAL,
      name: 'Technical Expert',
      description:
        'Engineers, technicians, and specialists who provide hands-on technical services, installation, maintenance, and repairs.',
      icon: WrenchScrewdriverIcon,
      examples: ['Field Engineer', 'Service Technician', 'Installation Specialist'],
    },
    {
      type: ExpertType.BUSINESS,
      name: 'Business Expert',
      description:
        'Consultants and advisors who provide business strategy, sourcing, and commercial services.',
      icon: BriefcaseIcon,
      examples: ['Procurement Consultant', 'Market Analyst', 'Trade Advisor'],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Choose Your Expert Type</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select the category that best describes your expertise and services.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {expertTypes.map((expert) => (
          <label
            key={expert.type}
            className={`relative flex cursor-pointer rounded-lg border p-5 shadow-sm focus:outline-none ${
              expertData.expertType === expert.type
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name="expertType"
              value={expert.type}
              checked={expertData.expertType === expert.type}
              onChange={() => updateExpertData({ expertType: expert.type })}
              className="sr-only"
            />

            <div className="flex flex-1">
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                    expertData.expertType === expert.type ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <expert.icon
                    className={`h-6 w-6 ${
                      expertData.expertType === expert.type ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-base font-medium ${
                      expertData.expertType === expert.type ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {expert.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{expert.description}</p>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Examples:</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {expert.examples.map((example) => (
                        <span
                          key={example}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${
                expertData.expertType === expert.type ? 'border-blue-600' : 'border-transparent'
              }`}
              aria-hidden="true"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
