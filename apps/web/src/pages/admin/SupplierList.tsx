import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { UserRole, OrganizationType } from '@device-passport/shared';
import toast from 'react-hot-toast';

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  backupContact?: string;
  backupPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
}

interface SupplierFormData {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  backupContact: string;
  backupPhone: string;
  address: string;
  city: string;
  country: string;
}

const INITIAL_FORM: SupplierFormData = {
  code: '',
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  backupContact: '',
  backupPhone: '',
  address: '',
  city: '',
  country: '',
};

export default function SupplierList() {
  const { t } = useTranslation();
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => organizationApi.getSuppliers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => organizationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(t('supplier.createSuccess'));
      closeModal();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('supplier.createError'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      organizationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(t('supplier.updateSuccess'));
      closeModal();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('supplier.updateError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(t('supplier.deleteSuccess'));
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('supplier.deleteError'));
    },
  });

  const openCreateModal = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setForm({
      code: supplier.code,
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      backupContact: supplier.backupContact || '',
      backupPhone: supplier.backupPhone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
    });
    setEditingId(supplier.id);
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.code || form.code.length !== 3) {
      newErrors.code = t('supplier.codeError');
    }
    if (!form.name) {
      newErrors.name = t('common.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = {
      ...form,
      code: form.code.toUpperCase(),
      type: OrganizationType.SUPPLIER,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('supplier.confirmDelete', { name }))) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('supplier.pageTitle', 'Suppliers - Device Passport System')}</title>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('supplier.title')}</h1>
          <p className="text-gray-600">{t('supplier.description')}</p>
        </div>
        {hasRole([UserRole.ADMIN]) && (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            {t('supplier.add')}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.code')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.companyName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.contactPerson')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.phone')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.backupContact')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : suppliers?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {t('supplier.noSuppliers')}
                  </td>
                </tr>
              ) : (
                suppliers?.map((supplier: Supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono font-medium text-primary-600">
                        {supplier.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      {supplier.city && supplier.country && (
                        <div className="text-sm text-gray-500">
                          {supplier.city}, {supplier.country}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.contactPerson || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.backupContact ? (
                        <div>
                          <div>{supplier.backupContact}</div>
                          {supplier.backupPhone && (
                            <div className="text-xs">{supplier.backupPhone}</div>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {hasRole([UserRole.ADMIN]) && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="text-primary-600 hover:text-primary-900"
                            title={t('common.edit')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id, supplier.name)}
                            className="text-red-600 hover:text-red-900"
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? t('supplier.edit') : t('supplier.add')}
                </h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('supplier.code')} * (3 {t('supplier.letters')})</label>
                  <input
                    type="text"
                    className="input"
                    maxLength={3}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SIE"
                    disabled={!!editingId}
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                </div>
                <div>
                  <label className="label">{t('supplier.companyName')} *</label>
                  <input
                    type="text"
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Siemens AG"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('supplier.contactPerson')}</label>
                  <input
                    type="text"
                    className="input"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div>
                  <label className="label">{t('supplier.phone')}</label>
                  <input
                    type="tel"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g., +49-89-123456"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('supplier.email')}</label>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g., contact@siemens.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('supplier.backupContact')}</label>
                  <input
                    type="text"
                    className="input"
                    value={form.backupContact}
                    onChange={(e) => setForm({ ...form, backupContact: e.target.value })}
                    placeholder="e.g., Jane Doe"
                  />
                </div>
                <div>
                  <label className="label">{t('supplier.backupPhone')}</label>
                  <input
                    type="tel"
                    className="input"
                    value={form.backupPhone}
                    onChange={(e) => setForm({ ...form, backupPhone: e.target.value })}
                    placeholder="e.g., +49-89-654321"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('supplier.address')}</label>
                <input
                  type="text"
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g., Werner-von-Siemens-Str. 1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('supplier.city')}</label>
                  <input
                    type="text"
                    className="input"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g., Munich"
                  />
                </div>
                <div>
                  <label className="label">{t('supplier.country')}</label>
                  <input
                    type="text"
                    className="input"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="e.g., Germany"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t('common.saving')
                    : editingId
                    ? t('common.save')
                    : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
