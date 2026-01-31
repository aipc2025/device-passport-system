import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistrationStore, WorkHistoryEntry } from '../../../store/registration.store';
import { PlusIcon, XMarkIcon, PencilIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

export default function ProfessionalInfoStep() {
  const { t } = useTranslation();
  const { expertData, updateExpertData } = useRegistrationStore();
  const [newCertification, setNewCertification] = useState('');
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
  const [workForm, setWorkForm] = useState<WorkHistoryEntry>({
    companyName: '',
    position: '',
    startDate: '',
    isCurrent: false,
  });

  const addCertification = () => {
    if (newCertification.trim()) {
      const certifications = [...(expertData.certifications || []), newCertification.trim()];
      updateExpertData({ certifications });
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    const certifications = (expertData.certifications || []).filter((_, i) => i !== index);
    updateExpertData({ certifications });
  };

  const handleAddWork = () => {
    setWorkForm({
      companyName: '',
      position: '',
      startDate: '',
      isCurrent: false,
    });
    setEditingWorkIndex(null);
    setIsAddingWork(true);
  };

  const handleEditWork = (index: number) => {
    const work = expertData.workHistory[index];
    setWorkForm(work);
    setEditingWorkIndex(index);
    setIsAddingWork(true);
  };

  const handleSaveWork = () => {
    if (!workForm.companyName.trim() || !workForm.position.trim() || !workForm.startDate) {
      return;
    }

    const workHistory = [...(expertData.workHistory || [])];
    if (editingWorkIndex !== null) {
      workHistory[editingWorkIndex] = workForm;
    } else {
      workHistory.push(workForm);
    }

    updateExpertData({ workHistory });
    setIsAddingWork(false);
    setEditingWorkIndex(null);
    setWorkForm({
      companyName: '',
      position: '',
      startDate: '',
      isCurrent: false,
    });
  };

  const handleRemoveWork = (index: number) => {
    const workHistory = expertData.workHistory.filter((_, i) => i !== index);
    updateExpertData({ workHistory });
  };

  const formatDateRange = (work: WorkHistoryEntry) => {
    const start = new Date(work.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (work.isCurrent) {
      return `${start} - ${t('professional.present', 'Present')}`;
    }
    if (work.endDate) {
      const end = new Date(work.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      return `${start} - ${end}`;
    }
    return start;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('professional.title', 'Professional Information')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('professional.subtitle', 'Tell us about your professional background and expertise.')}
        </p>
      </div>

      {/* Basic Professional Info */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          {t('professional.expertise', 'Expertise')}
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">{t('professional.field', 'Professional Field')}</label>
            <input
              type="text"
              value={expertData.professionalField || ''}
              onChange={(e) => updateExpertData({ professionalField: e.target.value })}
              className="input"
              placeholder={t('professional.fieldPlaceholder', 'e.g., Industrial Automation, PLC Programming')}
            />
          </div>

          <div>
            <label className="label">{t('professional.experience', 'Years of Experience')}</label>
            <input
              type="number"
              min="0"
              max="50"
              value={expertData.yearsOfExperience || ''}
              onChange={(e) =>
                updateExpertData({ yearsOfExperience: parseInt(e.target.value) || undefined })
              }
              className="input"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="label">{t('professional.services', 'Services Offered')}</label>
          <textarea
            rows={4}
            value={expertData.servicesOffered || ''}
            onChange={(e) => updateExpertData({ servicesOffered: e.target.value })}
            className="textarea"
            placeholder={t('professional.servicesPlaceholder', 'Describe the services you can provide, your specializations, and areas of expertise...')}
          />
          <p className="mt-2 text-xs text-gray-500">
            {t('professional.servicesHint', 'Be specific about your capabilities to help clients find you')}
          </p>
        </div>
      </div>

      {/* Work History */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-900">
            {t('professional.workHistory', 'Work History')}
          </h3>
          {!isAddingWork && (
            <button
              type="button"
              onClick={handleAddWork}
              className="btn-secondary text-sm px-3 py-1.5"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              {t('professional.addWork', 'Add Experience')}
            </button>
          )}
        </div>

        {isAddingWork && (
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('professional.companyName', 'Company Name')} *</label>
                <input
                  type="text"
                  value={workForm.companyName}
                  onChange={(e) => setWorkForm({ ...workForm, companyName: e.target.value })}
                  className="input"
                  placeholder={t('professional.companyPlaceholder', 'Enter company name')}
                />
              </div>

              <div>
                <label className="label">{t('professional.position', 'Position/Title')} *</label>
                <input
                  type="text"
                  value={workForm.position}
                  onChange={(e) => setWorkForm({ ...workForm, position: e.target.value })}
                  className="input"
                  placeholder={t('professional.positionPlaceholder', 'e.g., Senior Engineer')}
                />
              </div>

              <div>
                <label className="label">{t('professional.startDate', 'Start Date')} *</label>
                <input
                  type="month"
                  value={workForm.startDate}
                  onChange={(e) => setWorkForm({ ...workForm, startDate: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="label">{t('professional.endDate', 'End Date')}</label>
                <input
                  type="month"
                  value={workForm.endDate || ''}
                  onChange={(e) => setWorkForm({ ...workForm, endDate: e.target.value })}
                  className="input"
                  disabled={workForm.isCurrent}
                />
                <label className="flex items-center mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={workForm.isCurrent}
                    onChange={(e) => setWorkForm({ ...workForm, isCurrent: e.target.checked, endDate: undefined })}
                    className="rounded border-gray-300 text-primary-600 mr-2"
                  />
                  {t('professional.currentJob', 'I currently work here')}
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="label">{t('professional.description', 'Description')}</label>
                <textarea
                  rows={2}
                  value={workForm.description || ''}
                  onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                  className="textarea"
                  placeholder={t('professional.descriptionPlaceholder', 'Briefly describe your responsibilities and achievements...')}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsAddingWork(false);
                  setEditingWorkIndex(null);
                }}
                className="btn-secondary"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveWork}
                disabled={!workForm.companyName.trim() || !workForm.position.trim() || !workForm.startDate}
                className="btn-primary"
              >
                {editingWorkIndex !== null ? t('common.update', 'Update') : t('common.add', 'Add')}
              </button>
            </div>
          </div>
        )}

        {expertData.workHistory?.length === 0 && !isAddingWork ? (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
            <BriefcaseIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('professional.noWork', 'No work experience added yet')}</p>
            <p className="text-sm text-gray-400 mt-1">
              {t('professional.noWorkHint', 'Adding work history helps build trust with potential clients')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expertData.workHistory?.map((work, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{work.position}</h4>
                    <p className="text-sm text-gray-600">{work.companyName}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateRange(work)}</p>
                    {work.description && (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{work.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <button
                      type="button"
                      onClick={() => handleEditWork(index)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveWork(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          {t('professional.certifications', 'Certifications')}
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
            className="input flex-1"
            placeholder={t('professional.certPlaceholder', 'e.g., Siemens Certified Programmer')}
          />
          <button
            type="button"
            onClick={addCertification}
            disabled={!newCertification.trim()}
            className="btn-primary px-4"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {expertData.certifications && expertData.certifications.length > 0 ? (
          <ul className="space-y-2">
            {expertData.certifications.map((cert, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <span className="text-sm text-gray-900">{cert}</span>
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">{t('professional.noCerts', 'No certifications added')}</p>
        )}
      </div>

      <div className="bg-amber-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-amber-900">
          {t('professional.tipsTitle', 'Tips for a Strong Profile')}
        </h4>
        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
          <li>{t('professional.tip1', 'Include relevant industry certifications')}</li>
          <li>{t('professional.tip2', 'Mention specific equipment brands you\'re experienced with')}</li>
          <li>{t('professional.tip3', 'Highlight any specialized training or courses')}</li>
          <li>{t('professional.tip4', 'Be clear about your service coverage area')}</li>
        </ul>
      </div>
    </div>
  );
}
