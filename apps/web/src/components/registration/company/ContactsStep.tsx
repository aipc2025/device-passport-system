import { useState } from 'react';
import { useRegistrationStore } from '../../../store/registration.store';
import ContactCard, { ContactForm } from '../common/ContactCard';
import { ContactType, CONTACT_TYPE_NAMES } from '@device-passport/shared';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { ContactData } from '../../../store/registration.store';

const CONTACT_TYPES = [
  ContactType.BUSINESS,
  ContactType.TECHNICAL,
  ContactType.FINANCE,
  ContactType.EMERGENCY,
];

export default function ContactsStep() {
  const { companyData, addContact, updateContact, removeContact } = useRegistrationStore();
  const [editingType, setEditingType] = useState<ContactType | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddContact = (type: ContactType) => {
    setEditingType(type);
    setEditingIndex(null);
  };

  const handleEditContact = (index: number, contact: ContactData) => {
    setEditingType(contact.contactType);
    setEditingIndex(index);
  };

  const handleSaveContact = (contact: ContactData) => {
    if (editingIndex !== null) {
      updateContact(editingIndex, contact);
    } else {
      addContact(contact);
    }
    setEditingType(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingType(null);
    setEditingIndex(null);
  };

  const getContactsByType = (type: ContactType) => {
    return companyData.contacts
      .map((contact, index) => ({ contact, index }))
      .filter(({ contact }) => contact.contactType === type);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add contact persons for different departments. At least one business contact is recommended.
        </p>
      </div>

      {editingType ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {editingIndex !== null ? 'Edit' : 'Add'} {CONTACT_TYPE_NAMES[editingType]}
          </h3>
          <ContactForm
            contact={editingIndex !== null ? companyData.contacts[editingIndex] : undefined}
            contactType={editingType}
            onSave={handleSaveContact}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {CONTACT_TYPES.map((type) => {
            const contacts = getContactsByType(type);

            return (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {CONTACT_TYPE_NAMES[type]}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleAddContact(type)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No contacts added</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {contacts.map(({ contact, index }) => (
                      <ContactCard
                        key={index}
                        contact={contact}
                        onEdit={() => handleEditContact(index, contact)}
                        onDelete={() => removeContact(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
