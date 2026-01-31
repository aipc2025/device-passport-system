import { useState } from 'react';
import { PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import { ContactType, Gender, CONTACT_TYPE_NAMES } from '@device-passport/shared';
import type { ContactData } from '../../../store/registration.store';

interface ContactCardProps {
  contact: ContactData;
  onEdit: (contact: ContactData) => void;
  onDelete: () => void;
}

export default function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
            <p className="text-xs text-blue-600">
              {CONTACT_TYPE_NAMES[contact.contactType]}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onEdit(contact)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-600">
        {contact.position && (
          <p>
            <span className="text-gray-500">Position:</span> {contact.position}
          </p>
        )}
        {contact.email && (
          <p>
            <span className="text-gray-500">Email:</span> {contact.email}
          </p>
        )}
        {(contact.phone || contact.mobile) && (
          <p>
            <span className="text-gray-500">Phone:</span> {contact.mobile || contact.phone}
          </p>
        )}
      </div>

      {contact.isPrimary && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Primary Contact
          </span>
        </div>
      )}
    </div>
  );
}

interface ContactFormProps {
  contact?: ContactData;
  contactType: ContactType;
  onSave: (contact: ContactData) => void;
  onCancel: () => void;
}

export function ContactForm({ contact, contactType, onSave, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactData>(
    contact || {
      contactType,
      name: '',
      isPrimary: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender || ''}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value as Gender || undefined })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select...</option>
            <option value={Gender.MALE}>Male</option>
            <option value={Gender.FEMALE}>Female</option>
            <option value={Gender.OTHER}>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input
            type="text"
            value={formData.position || ''}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            value={formData.department || ''}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input
            type="tel"
            value={formData.mobile || ''}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrimary"
            checked={formData.isPrimary}
            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
            Set as primary contact for this type
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {contact ? 'Update Contact' : 'Add Contact'}
        </button>
      </div>
    </form>
  );
}
