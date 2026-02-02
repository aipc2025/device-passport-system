import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ClipboardList,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  UserPlus,
  X,
  Search,
} from 'lucide-react';
import { serviceOrderApi } from '../../services/api';
import { ServiceOrder, ServiceRecord, ServiceOrderStatus, ServicePriority } from '@device-passport/shared';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

interface Engineer {
  id: string;
  name: string;
  email: string;
  role: string;
}

const statusColors: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.PENDING]: 'badge-warning',
  [ServiceOrderStatus.ASSIGNED]: 'badge-info',
  [ServiceOrderStatus.IN_PROGRESS]: 'badge-info',
  [ServiceOrderStatus.ON_HOLD]: 'badge-warning',
  [ServiceOrderStatus.COMPLETED]: 'badge-success',
  [ServiceOrderStatus.CANCELLED]: 'badge-gray',
};

const priorityColors: Record<ServicePriority, string> = {
  [ServicePriority.LOW]: 'badge-gray',
  [ServicePriority.MEDIUM]: 'badge-info',
  [ServicePriority.HIGH]: 'badge-warning',
  [ServicePriority.URGENT]: 'badge-danger',
};

export default function ServiceOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: order, isLoading } = useQuery<ServiceOrder>({
    queryKey: ['service-order', id],
    queryFn: () => serviceOrderApi.getById(id!),
    enabled: !!id,
  });

  const { data: records } = useQuery<ServiceRecord[]>({
    queryKey: ['service-order-records', id],
    queryFn: () => serviceOrderApi.getRecords(id!),
    enabled: !!id,
  });

  const { data: availableEngineers } = useQuery<Engineer[]>({
    queryKey: ['available-engineers'],
    queryFn: () => serviceOrderApi.getAvailableEngineers(),
    enabled: showAssignModal,
  });

  const assignMutation = useMutation({
    mutationFn: (engineerId: string) => serviceOrderApi.assignEngineer(id!, engineerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-order', id] });
      setShowAssignModal(false);
      toast.success('Engineer assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign engineer');
    },
  });

  const filteredEngineers = availableEngineers?.filter((eng) =>
    eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Service order not found</p>
        <Link to="/service-orders" className="btn-primary mt-4">
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${order.orderNumber} - ${order.title} - Device Passport System`}</title>
      </Helmet>
      <div className="space-y-6">
        <Link
          to="/service-orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Service Orders
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="h-6 w-6 text-primary-600" />
              <span className="font-mono text-lg font-semibold">{order.orderNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{order.title}</h1>
            <p className="text-gray-600 mt-1">
              Device:{' '}
              <Link
                to={`/scan/${order.passportCode}`}
                className="text-primary-600 hover:text-primary-500 font-mono"
              >
                {order.passportCode}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx('badge', priorityColors[order.priority])}>
              {order.priority}
            </span>
            <span className={clsx('badge', statusColors[order.status])}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Service Type</dt>
                <dd className="font-medium">{order.serviceType}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Description</dt>
                <dd className="text-gray-900 whitespace-pre-wrap">{order.description}</dd>
              </div>
              {order.customerNotes && (
                <div>
                  <dt className="text-sm text-gray-500">Customer Notes</dt>
                  <dd className="text-gray-900">{order.customerNotes}</dd>
                </div>
              )}
              {order.resolutionNotes && (
                <div>
                  <dt className="text-sm text-gray-500">Resolution Notes</dt>
                  <dd className="text-gray-900">{order.resolutionNotes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Service Records */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Records</h2>
            {records && records.length > 0 ? (
              <div className="space-y-4">
                {records.map((record: ServiceRecord) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="badge-info">{record.recordType}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(record.createdAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-900">{record.workPerformed}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>By: {record.engineerName}</span>
                      <span>Duration: {record.workTime} mins</span>
                    </div>
                    {record.partsUsed && record.partsUsed.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Parts used:</span>
                        <ul className="text-sm text-gray-600 ml-4">
                          {record.partsUsed.map((part, idx) => (
                            <li key={idx}>
                              {part.partName} ({part.partNumber}) x{part.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No service records yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <dl className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{order.contactName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{order.contactPhone}</span>
              </div>
              {order.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{order.contactEmail}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <span className="text-gray-900">
                  {order.serviceAddress}
                  {order.serviceCity && `, ${order.serviceCity}`}
                </span>
              </div>
            </dl>
          </div>

          {/* Schedule */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
            <dl className="space-y-3">
              {order.requestedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs text-gray-500">Requested</dt>
                    <dd className="text-gray-900">
                      {format(new Date(order.requestedDate), 'MMM d, yyyy')}
                    </dd>
                  </div>
                </div>
              )}
              {order.scheduledDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs text-gray-500">Scheduled</dt>
                    <dd className="text-gray-900">
                      {format(new Date(order.scheduledDate), 'MMM d, yyyy')}
                    </dd>
                  </div>
                </div>
              )}
              {order.completedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs text-gray-500">Completed</dt>
                    <dd className="text-gray-900">
                      {format(new Date(order.completedDate), 'MMM d, yyyy')}
                    </dd>
                  </div>
                </div>
              )}
              {order.estimatedDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs text-gray-500">Estimated Duration</dt>
                    <dd className="text-gray-900">{order.estimatedDuration} hours</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Assigned Engineer */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Engineer</h2>
            {order.assignedEngineerName ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {order.assignedEngineerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{order.assignedEngineerName}</span>
                </div>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">No engineer assigned yet</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign Engineer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Engineer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Assign Engineer</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search engineers..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredEngineers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No engineers found</p>
              ) : (
                <div className="space-y-2">
                  {filteredEngineers.map((engineer) => (
                    <button
                      key={engineer.id}
                      onClick={() => assignMutation.mutate(engineer.id)}
                      disabled={assignMutation.isPending}
                      className={clsx(
                        'w-full p-3 rounded-lg border text-left hover:border-blue-500 hover:bg-blue-50 transition-colors',
                        assignMutation.isPending && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {engineer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{engineer.name}</p>
                          <p className="text-sm text-gray-500">{engineer.email}</p>
                        </div>
                        <span className="ml-auto text-xs px-2 py-1 bg-gray-100 rounded">
                          {engineer.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
