import { useState, useEffect } from 'react';
import { registrationApi } from '../../services/api';
import {
  RegistrationType,
  RegistrationStatus,
  ExpertType,
  REGISTRATION_STATUS_NAMES,
} from '@device-passport/shared';
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface PendingRegistration {
  id: string;
  registrationType: RegistrationType;
  name: string;
  email: string;
  status: RegistrationStatus;
  submittedAt: string;
  companyCode?: string;
  isSupplier?: boolean;
  isBuyer?: boolean;
  expertType?: ExpertType;
}

export default function PendingRegistrations() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await registrationApi.getPending();
      setRegistrations(data);
    } catch (err) {
      setError('Failed to load pending registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleViewDetails = async (reg: PendingRegistration) => {
    setSelectedRegistration(reg.id);
    setDetailsLoading(true);
    setAdminNotes('');

    try {
      const data =
        reg.registrationType === RegistrationType.COMPANY
          ? await registrationApi.getCompanyDetails(reg.id)
          : await registrationApi.getExpertDetails(reg.id);
      setDetails(data);
    } catch (err) {
      console.error('Failed to load details:', err);
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reg: PendingRegistration,
    newStatus: RegistrationStatus
  ) => {
    setActionLoading(true);

    try {
      await registrationApi.updateStatus(reg.id, reg.registrationType, {
        status: newStatus,
        adminNotes: adminNotes || undefined,
      });

      // Refresh list
      await fetchRegistrations();
      setSelectedRegistration(null);
      setDetails(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchRegistrations}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Registrations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve new company and expert registrations
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="h-5 w-5" />
          <span>{registrations.length} pending</span>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">
            No pending registrations to review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Registration List */}
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRegistration === reg.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleViewDetails(reg)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        reg.registrationType === RegistrationType.COMPANY
                          ? 'bg-blue-100'
                          : 'bg-green-100'
                      }`}
                    >
                      {reg.registrationType === RegistrationType.COMPANY ? (
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <UserCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{reg.name}</h3>
                      <p className="text-xs text-gray-500">{reg.email}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reg.status === RegistrationStatus.PENDING
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {REGISTRATION_STATUS_NAMES[reg.status]}
                  </span>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatDate(reg.submittedAt)}</span>
                  {reg.companyCode && (
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {reg.companyCode}
                    </span>
                  )}
                  {reg.isSupplier && (
                    <span className="text-green-600">Supplier</span>
                  )}
                  {reg.isBuyer && <span className="text-blue-600">Buyer</span>}
                  {reg.expertType && (
                    <span className="text-purple-600">
                      {reg.expertType === ExpertType.TECHNICAL ? 'Technical' : 'Business'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Details Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {selectedRegistration ? (
              detailsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : details ? (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">Registration Details</h2>

                  {/* Show details based on registration type */}
                  <div className="space-y-4 text-sm">
                    {'profile' in details && (
                      <>
                        <div>
                          <h3 className="font-medium text-gray-700">Company Info</h3>
                          <dl className="mt-2 space-y-1">
                            <div>
                              <dt className="text-gray-500">Name:</dt>
                              <dd>
                                {String((details.organization as { name?: string })?.name || 'N/A')}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Type:</dt>
                              <dd>
                                {String((details.profile as { companyType?: string })?.companyType || 'N/A')}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        {'contacts' in details && (
                          <div>
                            <h3 className="font-medium text-gray-700">
                              Contacts ({(details.contacts as unknown[])?.length || 0})
                            </h3>
                          </div>
                        )}

                        {'products' in details && (
                          <div>
                            <h3 className="font-medium text-gray-700">
                              Products ({(details.products as unknown[])?.length || 0})
                            </h3>
                          </div>
                        )}
                      </>
                    )}

                    {'expert' in details && (
                      <>
                        <div>
                          <h3 className="font-medium text-gray-700">Expert Info</h3>
                          <dl className="mt-2 space-y-1">
                            <div>
                              <dt className="text-gray-500">Name:</dt>
                              <dd>
                                {String((details.expert as { personalName?: string })?.personalName || 'N/A')}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Type:</dt>
                              <dd>
                                {String((details.expert as { expertType?: string })?.expertType || 'N/A')}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Field:</dt>
                              <dd>
                                {String((details.expert as { professionalField?: string })?.professionalField || 'N/A')}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Admin Notes
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Add notes (visible to applicant if rejected)"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        const reg = registrations.find((r) => r.id === selectedRegistration);
                        if (reg) handleUpdateStatus(reg, RegistrationStatus.APPROVED);
                      }}
                      disabled={actionLoading}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reg = registrations.find((r) => r.id === selectedRegistration);
                        if (reg) handleUpdateStatus(reg, RegistrationStatus.REJECTED);
                      }}
                      disabled={actionLoading}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Failed to load details</p>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <EyeIcon className="h-12 w-12 text-gray-300" />
                <p className="mt-2">Select a registration to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
