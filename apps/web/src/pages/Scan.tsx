import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { scanApi } from '../services/api';
import toast from 'react-hot-toast';

interface ScanForm {
  code: string;
}

export default function Scan() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScanForm>();

  const onSubmit = async (data: ScanForm) => {
    setIsLoading(true);
    setError(null);

    try {
      // First validate the code format
      const validation = await scanApi.validateCode(data.code);
      if (!validation.valid) {
        setError(validation.error || 'Invalid passport code format');
        return;
      }

      // Navigate to device detail page
      navigate(`/scan/${data.code.toUpperCase()}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to scan device');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
          <QrCode className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Device Passport</h1>
        <p className="text-gray-600">
          Enter the device passport code to view its information and history
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="code" className="label">
              Passport Code
            </label>
            <input
              id="code"
              type="text"
              placeholder="DP-MED-2025-PLC-DE-000001-A7"
              className="input uppercase"
              {...register('code', {
                required: 'Passport code is required',
                pattern: {
                  value: /^DP-[A-Z]{3}-\d{4}-[A-Z]{3}-[A-Z]{2}-\d{6}-[A-Z0-9]{2}$/i,
                  message: 'Invalid passport code format',
                },
              })}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Format: DP-XXX-YYYY-XXX-XX-NNNNNN-CC
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3"
          >
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search Device
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Code Format Explanation</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-mono">DP</span> - Device Passport prefix</p>
            <p><span className="font-mono">XXX</span> - Company code (3 letters)</p>
            <p><span className="font-mono">YYYY</span> - Year</p>
            <p><span className="font-mono">XXX</span> - Product line (PLC, MOT, SEN, etc.)</p>
            <p><span className="font-mono">XX</span> - Origin country code</p>
            <p><span className="font-mono">NNNNNN</span> - Sequence number</p>
            <p><span className="font-mono">CC</span> - Checksum</p>
          </div>
        </div>
      </div>
    </div>
  );
}
