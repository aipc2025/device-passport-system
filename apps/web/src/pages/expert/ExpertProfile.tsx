import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { User, Save, Phone, MapPin, Briefcase, Award, Calendar, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { expertApi } from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ExpertProfileForm {
  personalName: string;
  phone: string;
  dateOfBirth: string;
  professionalField: string;
  servicesOffered: string;
  yearsOfExperience: number;
  certifications: string[];
  currentLocation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

export default function ExpertProfile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [certInput, setCertInput] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['expert-profile', user?.expertId],
    queryFn: () => expertApi.getProfile(user?.expertId as string),
    enabled: !!user?.expertId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ExpertProfileForm>();

  const certifications = watch('certifications') || [];

  useEffect(() => {
    if (profile) {
      reset({
        personalName: profile.personalName || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        professionalField: profile.professionalField || '',
        servicesOffered: profile.servicesOffered || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        certifications: profile.certifications || [],
        currentLocation: profile.currentLocation || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        emergencyContactRelationship: profile.emergencyContactRelationship || '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ExpertProfileForm>) =>
      expertApi.updateProfile(user?.expertId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-profile'] });
      toast.success(t('expert.profileUpdated', 'Profile updated successfully'));
    },
    onError: () => {
      toast.error(t('expert.profileUpdateFailed', 'Failed to update profile'));
    },
  });

  const onSubmit = (data: ExpertProfileForm) => {
    updateMutation.mutate(data);
  };

  const addCertification = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setValue('certifications', [...certifications, certInput.trim()], { shouldDirty: true });
      setCertInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setValue('certifications', certifications.filter(c => c !== cert), { shouldDirty: true });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile - Device Passport System</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6" />
          {t('expert.profile', 'Expert Profile')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('expert.profileDesc', 'Manage your professional information and qualifications')}
        </p>
      </div>

      {/* Registration Status */}
      {profile?.registrationStatus && profile.registrationStatus !== 'APPROVED' && (
        <div className={clsx(
          'mb-6 p-4 rounded-lg border flex items-start gap-3',
          profile.registrationStatus === 'PENDING' && 'bg-yellow-50 border-yellow-200',
          profile.registrationStatus === 'REJECTED' && 'bg-red-50 border-red-200'
        )}>
          <AlertTriangle className={clsx(
            'w-5 h-5 mt-0.5',
            profile.registrationStatus === 'PENDING' && 'text-yellow-600',
            profile.registrationStatus === 'REJECTED' && 'text-red-600'
          )} />
          <div>
            <p className={clsx(
              'font-medium',
              profile.registrationStatus === 'PENDING' && 'text-yellow-800',
              profile.registrationStatus === 'REJECTED' && 'text-red-800'
            )}>
              {profile.registrationStatus === 'PENDING'
                ? t('expert.pendingApproval', 'Your registration is pending approval')
                : t('expert.registrationRejected', 'Your registration was rejected')
              }
            </p>
            {profile.adminNotes && (
              <p className="text-sm mt-1 text-gray-600">{profile.adminNotes}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('expert.personalInfo', 'Personal Information')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.name', 'Name')} *
              </label>
              <input
                {...register('personalName', { required: true })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md',
                  errors.personalName ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                {t('common.phone', 'Phone')}
              </label>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('expert.dateOfBirth', 'Date of Birth')}
              </label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                {t('expert.location', 'Current Location')}
              </label>
              <input
                {...register('currentLocation')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {t('expert.professionalInfo', 'Professional Information')}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('expert.professionalField', 'Professional Field')}
                </label>
                <input
                  {...register('professionalField')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={t('expert.fieldPlaceholder', 'e.g., PLC Programming, Motor Repair')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('expert.yearsExperience', 'Years of Experience')}
                </label>
                <input
                  type="number"
                  {...register('yearsOfExperience', { valueAsNumber: true, min: 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('expert.servicesOffered', 'Services Offered')}
              </label>
              <textarea
                {...register('servicesOffered')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={t('expert.servicesPlaceholder', 'Describe the services you offer...')}
              />
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            {t('expert.certifications', 'Certifications')}
          </h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder={t('expert.addCertification', 'Add certification...')}
              />
              <button
                type="button"
                onClick={addCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('common.add', 'Add')}
              </button>
            </div>
            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('expert.emergencyContact', 'Emergency Contact')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.name', 'Name')}
              </label>
              <input
                {...register('emergencyContactName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.phone', 'Phone')}
              </label>
              <input
                {...register('emergencyContactPhone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('expert.relationship', 'Relationship')}
              </label>
              <input
                {...register('emergencyContactRelationship')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={t('expert.relationshipPlaceholder', 'e.g., Spouse, Parent')}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className={clsx(
              'flex items-center gap-2 px-6 py-2 rounded-md font-medium',
              isDirty
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending
              ? t('common.saving', 'Saving...')
              : t('common.saveChanges', 'Save Changes')
            }
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
