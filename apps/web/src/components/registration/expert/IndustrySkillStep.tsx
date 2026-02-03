import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../../store/registration.store';
import {
  IndustryCode,
  SkillCode,
  ExpertType,
  INDUSTRY_CODE_NAMES,
  SKILL_CODE_NAMES,
  SkillCategory,
  SKILL_CATEGORY_NAMES,
} from '@device-passport/shared';
import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

// Group skills by category - using correct abbreviated SkillCode values
const SKILLS_BY_CATEGORY: Record<SkillCategory, SkillCode[]> = {
  [SkillCategory.AUTOMATION]: [
    SkillCode.PL, // PLC Programming
    SkillCode.HM, // HMI Design
    SkillCode.RB, // Robotics
    SkillCode.MC, // Motion Control
    SkillCode.VS, // Vision Systems
    SkillCode.IO, // IoT
  ],
  [SkillCategory.ELECTROMECHANICAL]: [
    SkillCode.ED, // Electrical Design
    SkillCode.EI, // Electrical Installation
    SkillCode.MD, // Mechanical Design
    SkillCode.MI, // Mechanical Installation
    SkillCode.HD, // Hydraulics
    SkillCode.WD, // Welding
  ],
  [SkillCategory.INSTRUMENTATION]: [
    SkillCode.IS, // Instrumentation
    SkillCode.NT, // Networks
    SkillCode.SC, // Safety Systems
  ],
  [SkillCategory.SOFTWARE]: [
    SkillCode.SW, // Software Development
    SkillCode.AI, // AI/Machine Learning
  ],
  [SkillCategory.SERVICE]: [
    SkillCode.MN, // Maintenance
    SkillCode.CM, // Commissioning
    SkillCode.PM, // Project Management
  ],
};

export default function IndustrySkillStep() {
  const { t, i18n } = useTranslation();
  const { expertData, updateExpertData } = useRegistrationStore();
  // Support zh, en, vi - default to en for other languages
  const lang = i18n.language.startsWith('zh') ? 'zh' : i18n.language.startsWith('vi') ? 'vi' : 'en';

  const toggleIndustry = (code: IndustryCode) => {
    const industries = [...(expertData.industries || [])];
    const index = industries.indexOf(code);
    if (index === -1) {
      industries.push(code);
    } else {
      industries.splice(index, 1);
    }
    updateExpertData({ industries });
  };

  const toggleSkill = (code: SkillCode) => {
    const skills = [...(expertData.skills || [])];
    const index = skills.indexOf(code);
    if (index === -1) {
      skills.push(code);
    } else {
      skills.splice(index, 1);
    }
    updateExpertData({ skills });
  };

  const moveIndustryToFirst = (code: IndustryCode) => {
    const industries = expertData.industries?.filter(i => i !== code) || [];
    industries.unshift(code);
    updateExpertData({ industries });
  };

  const moveSkillToFirst = (code: SkillCode) => {
    const skills = expertData.skills?.filter(s => s !== code) || [];
    skills.unshift(code);
    updateExpertData({ skills });
  };

  const allIndustries = Object.values(IndustryCode);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('expert.industrySkill', 'Industry & Skills')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('expert.industrySkillDesc', 'Select your primary industry and skills. The first selection will be used for your passport code.')}
        </p>
      </div>

      {/* Industry Selection */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">
            {t('expert.industry', 'Industry')} *
          </h3>
          <span className="text-sm text-gray-500">
            {t('expert.selectedCount', 'Selected')}: {expertData.industries?.length || 0}
          </span>
        </div>

        {expertData.industries?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-amber-600 mb-2">
              {t('expert.primaryIndustry', 'Primary industry (for passport code)')}:
              <span className="font-semibold ml-1">
                {INDUSTRY_CODE_NAMES[expertData.industries[0]]?.[lang]}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {expertData.industries.map((code, idx) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => moveIndustryToFirst(code)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-full transition-colors',
                    idx === 0
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  )}
                >
                  {idx === 0 && <span className="mr-1">1.</span>}
                  {INDUSTRY_CODE_NAMES[code]?.[lang]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {allIndustries.map((code) => {
            const isSelected = expertData.industries?.includes(code);
            const name = INDUSTRY_CODE_NAMES[code]?.[lang] || code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleIndustry(code)}
                className={clsx(
                  'flex items-center px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                <span>{name}</span>
                {isSelected && <CheckIcon className="h-4 w-4 ml-1 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill Selection */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">
            {t('expert.skills', 'Skills')} *
          </h3>
          <span className="text-sm text-gray-500">
            {t('expert.selectedCount', 'Selected')}: {expertData.skills?.length || 0}
          </span>
        </div>

        {expertData.skills?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-amber-600 mb-2">
              {t('expert.primarySkill', 'Primary skill (for passport code)')}:
              <span className="font-semibold ml-1">
                {SKILL_CODE_NAMES[expertData.skills[0]]?.[lang]}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {expertData.skills.map((code, idx) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => moveSkillToFirst(code)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-full transition-colors',
                    idx === 0
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  )}
                >
                  {idx === 0 && <span className="mr-1">1.</span>}
                  {SKILL_CODE_NAMES[code]?.[lang]}
                </button>
              ))}
            </div>
          </div>
        )}

        {Object.entries(SKILLS_BY_CATEGORY).map(([category, skills]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">
              {SKILL_CATEGORY_NAMES[category as SkillCategory]?.[lang]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((code) => {
                const isSelected = expertData.skills?.includes(code);
                const name = SKILL_CODE_NAMES[code]?.[lang] || code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleSkill(code)}
                    className={clsx(
                      'flex items-center px-3 py-2 text-sm rounded-lg border transition-all whitespace-nowrap',
                      isSelected
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <span>{name}</span>
                    {isSelected && <CheckIcon className="h-4 w-4 ml-1 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Passport Code Preview */}
      {expertData.industries?.length > 0 && expertData.skills?.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {t('expert.passportPreview', 'Passport Code Preview')}
          </h4>
          <p className="text-xs text-blue-700 mb-2">
            {t('expert.passportPreviewNote', 'Your expert passport code will include:')}
          </p>
          <div className="font-mono text-lg text-blue-800">
            EP-<span className="text-primary-600">{expertData.expertTypes?.length === 2 ? 'A' : expertData.expertTypes?.includes(ExpertType.TECHNICAL) ? 'T' : 'B'}</span>
            <span className="text-amber-600">{expertData.industries[0]}</span>
            <span className="text-green-600">{expertData.skills[0]}</span>
            -YYMM-{expertData.nationality?.toUpperCase() || 'XX'}-NNNNNN-CC
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {INDUSTRY_CODE_NAMES[expertData.industries[0]]?.[lang]} + {SKILL_CODE_NAMES[expertData.skills[0]]?.[lang]}
          </p>
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-amber-900">
          {t('expert.selectionTips', 'Selection Tips')}
        </h4>
        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
          <li>{t('expert.tip1', 'Select your most experienced industry first')}</li>
          <li>{t('expert.tip2', 'Your primary selections will be used for passport code generation')}</li>
          <li>{t('expert.tip3', 'You can select multiple industries and skills')}</li>
          <li>{t('expert.tip4', 'Click on selected items to reorder (first = primary)')}</li>
        </ul>
      </div>
    </div>
  );
}
