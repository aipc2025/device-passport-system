import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../../store/registration.store';
import { ExpertType } from '@device-passport/shared';
import { WrenchScrewdriverIcon, BriefcaseIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function ExpertTypeStep() {
  const { t } = useTranslation();
  const { expertData, updateExpertData } = useRegistrationStore();

  const expertTypes = [
    {
      type: ExpertType.TECHNICAL,
      name: t('expertType.technical.name', 'Technical Expert'),
      description: t(
        'expertType.technical.description',
        'Engineers, technicians, and specialists who provide hands-on technical services, installation, maintenance, and repairs.'
      ),
      icon: WrenchScrewdriverIcon,
      examples: [
        t('expertType.technical.example1', 'Field Engineer'),
        t('expertType.technical.example2', 'Service Technician'),
        t('expertType.technical.example3', 'Installation Specialist'),
      ],
    },
    {
      type: ExpertType.BUSINESS,
      name: t('expertType.business.name', 'Business Expert'),
      description: t(
        'expertType.business.description',
        'Consultants and advisors who provide business strategy, sourcing, and commercial services.'
      ),
      icon: BriefcaseIcon,
      examples: [
        t('expertType.business.example1', 'Procurement Consultant'),
        t('expertType.business.example2', 'Market Analyst'),
        t('expertType.business.example3', 'Trade Advisor'),
      ],
    },
  ];

  const toggleExpertType = (type: ExpertType) => {
    const currentTypes = expertData.expertTypes || [];
    const isSelected = currentTypes.includes(type);

    if (isSelected) {
      updateExpertData({ expertTypes: currentTypes.filter((t) => t !== type) });
    } else {
      updateExpertData({ expertTypes: [...currentTypes, type] });
    }
  };

  const isSelected = (type: ExpertType) => {
    return (expertData.expertTypes || []).includes(type);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('expertType.title', 'Choose Your Expert Type')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('expertType.subtitle', 'Select one or more categories that best describe your expertise and services. You can select both if applicable.')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {expertTypes.map((expert) => (
          <button
            key={expert.type}
            type="button"
            onClick={() => toggleExpertType(expert.type)}
            className={`relative flex text-left cursor-pointer rounded-xl border-2 p-5 transition-all ${
              isSelected(expert.type)
                ? 'border-primary-600 bg-primary-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-1">
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                    isSelected(expert.type) ? 'bg-primary-100' : 'bg-gray-100'
                  }`}
                >
                  <expert.icon
                    className={`h-6 w-6 ${
                      isSelected(expert.type) ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-base font-semibold ${
                      isSelected(expert.type) ? 'text-primary-900' : 'text-gray-900'
                    }`}
                  >
                    {expert.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{expert.description}</p>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500 font-medium">
                      {t('expertType.examples', 'Examples')}:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {expert.examples.map((example) => (
                        <span
                          key={example}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            isSelected(expert.type)
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            <div
              className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                isSelected(expert.type)
                  ? 'bg-primary-600'
                  : 'border-2 border-gray-300'
              }`}
            >
              {isSelected(expert.type) && (
                <CheckIcon className="h-4 w-4 text-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      {(expertData.expertTypes?.length || 0) === 0 && (
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            {t('expertType.selectHint', 'Please select at least one expert type to continue.')}
          </p>
        </div>
      )}

      {(expertData.expertTypes?.length || 0) === 2 && (
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-700">
            {t('expertType.bothSelected', 'Great! You\'ve selected both expert types. This allows you to offer a wider range of services.')}
          </p>
        </div>
      )}
    </div>
  );
}
