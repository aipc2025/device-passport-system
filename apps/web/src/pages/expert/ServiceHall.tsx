import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Calendar, Search, Building2, Wrench } from 'lucide-react';
import { expertApi } from '../../services/api';
import clsx from 'clsx';

interface ServiceRequest {
  id: string;
  requestCode: string;
  title: string;
  description: string;
  serviceType: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  serviceLocation?: string;
  locationLat?: number;
  locationLng?: number;
  requiredSkills: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  deadline?: string;
  preferredDate?: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
  viewCount: number;
  applicationCount: number;
}

const urgencyConfig: Record<string, { color: string; label: string }> = {
  LOW: { color: 'bg-green-100 text-green-800', label: 'Low' },
  NORMAL: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
  HIGH: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  URGENT: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
};

export default function ServiceHall() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['public-service-requests', searchTerm, selectedType, selectedUrgency],
    queryFn: () => expertApi.getPublicServiceRequests({
      search: searchTerm,
      serviceType: selectedType,
      urgency: selectedUrgency,
    }),
  });

  const { data: serviceTypes } = useQuery({
    queryKey: ['service-types'],
    queryFn: () => expertApi.getServiceTypes(),
  });

  return (
    <>
      <Helmet>
        <title>Service Hall - Device Passport System</title>
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            {t('expert.serviceHall', 'Service Hall')}
          </h1>
        <p className="text-gray-600 mt-1">
          {t('expert.serviceHallDesc', 'Browse and apply for public service requests')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('common.search', 'Search...')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Service Type Filter */}
          <div className="min-w-[150px]">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('expert.allTypes', 'All Types')}</option>
              {serviceTypes?.map((type: { value: string; label: string }) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="min-w-[150px]">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('expert.allUrgency', 'All Urgency')}</option>
              {Object.entries(urgencyConfig).map(([key, config]) => (
                <option key={key} value={key}>{t(`urgency.${key}`, config.label)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Service Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-40 animate-pulse" />
          ))}
        </div>
      ) : requests?.data && requests.data.length > 0 ? (
        <div className="space-y-4">
          {requests.data.map((request: ServiceRequest) => {
            const urgency = urgencyConfig[request.urgency] || urgencyConfig.NORMAL;

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm text-gray-500">
                        {request.requestCode}
                      </span>
                      <span className={clsx(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        urgency.color
                      )}>
                        {t(`urgency.${request.urgency}`, urgency.label)}
                      </span>
                      {request.serviceType && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          <Wrench className="w-3 h-3 mr-1" />
                          {request.serviceType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.title}
                    </h3>
                    {request.organization && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {request.organization.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {(request.budgetMin || request.budgetMax) && (
                      <p className="text-lg font-semibold text-green-600">
                        {request.budgetCurrency || 'USD'}{' '}
                        {request.budgetMin && request.budgetMax
                          ? `${request.budgetMin.toLocaleString()} - ${request.budgetMax.toLocaleString()}`
                          : (request.budgetMax || request.budgetMin || 0).toLocaleString()
                        }
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {request.applicationCount} {t('expert.applicants', 'applicants')}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {request.description}
                </p>

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  {request.serviceLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {request.serviceLocation}
                    </span>
                  )}
                  {request.preferredDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t('expert.preferredDate', 'Preferred')}: {new Date(request.preferredDate).toLocaleDateString()}
                    </span>
                  )}
                  {request.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t('expert.deadline', 'Deadline')}: {new Date(request.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Required Skills */}
                {request.requiredSkills && request.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {request.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {t('expert.posted', 'Posted')}: {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/expert/service-hall/${request.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {t('expert.viewAndApply', 'View & Apply')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {t('expert.noServiceRequests', 'No service requests available')}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t('expert.noServiceRequestsDesc', 'Check back later for new opportunities')}
          </p>
        </div>
      )}
    </div>
    </>
  );
}
