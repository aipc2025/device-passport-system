import { useState } from 'react';
import { useRegistrationStore } from '../../../store/registration.store';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ProfessionalInfoStep() {
  const { expertData, updateExpertData } = useRegistrationStore();
  const [newCertification, setNewCertification] = useState('');

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Professional Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your professional background and expertise.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Professional Field</label>
          <input
            type="text"
            value={expertData.professionalField || ''}
            onChange={(e) => updateExpertData({ professionalField: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Industrial Automation, PLC Programming"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
          <input
            type="number"
            min="0"
            max="50"
            value={expertData.yearsOfExperience || ''}
            onChange={(e) =>
              updateExpertData({ yearsOfExperience: parseInt(e.target.value) || undefined })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Services Offered</label>
        <textarea
          rows={4}
          value={expertData.servicesOffered || ''}
          onChange={(e) => updateExpertData({ servicesOffered: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Describe the services you can provide, your specializations, and areas of expertise..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Be specific about your capabilities to help clients find you
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>

        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Siemens Certified Programmer"
          />
          <button
            type="button"
            onClick={addCertification}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {expertData.certifications && expertData.certifications.length > 0 ? (
          <ul className="space-y-2">
            {expertData.certifications.map((cert, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <span className="text-sm text-gray-900">{cert}</span>
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No certifications added</p>
        )}
      </div>

      <div className="bg-amber-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900">Tips for a Strong Profile</h4>
        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
          <li>Include relevant industry certifications</li>
          <li>Mention specific equipment brands you're experienced with</li>
          <li>Highlight any specialized training or courses</li>
          <li>Be clear about your service coverage area</li>
        </ul>
      </div>
    </div>
  );
}
