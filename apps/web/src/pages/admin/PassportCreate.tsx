import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { passportApi, organizationApi } from '../../services/api';
import { ProductLine, OriginCode } from '@device-passport/shared';
import toast from 'react-hot-toast';
import MapPicker from '../../components/common/MapPicker';

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

interface CreatePassportForm {
  productLine: ProductLine;
  originCode: OriginCode;
  customOriginCode?: string;
  deviceName: string;
  deviceModel: string;
  supplierId?: string;
  manufacturer: string;
  manufacturerPartNumber?: string;
  serialNumber?: string;
  manufactureDate?: string;
  warrantyExpiryDate?: string;
  currentLocation?: string;
  locationLat?: number;
  locationLng?: number;
  // Buyer information
  buyerCompany?: string;
  buyerContact?: string;
  buyerPhone?: string;
  buyerCountry?: string;
  customBuyerCountry?: string;
  buyerAddress?: string;
  buyerAddressLat?: number;
  buyerAddressLng?: number;
  buyerEmail?: string;
}

const productLines = Object.values(ProductLine);
const originCodes = Object.values(OriginCode);

const COUNTRY_LIST = [
  { code: 'CN', name: 'China' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'US', name: 'United States' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'IT', name: 'Italy' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
];

interface Supplier {
  id: string;
  code: string;
  name: string;
}

export default function PassportCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showBuyerInfo, setShowBuyerInfo] = useState(false);
  const [deviceLocation, setDeviceLocation] = useState<LocationData | undefined>();
  const [buyerLocation, setBuyerLocation] = useState<LocationData | undefined>();
  const [showCustomOrigin, setShowCustomOrigin] = useState(false);
  const [showCustomBuyerCountry, setShowCustomBuyerCountry] = useState(false);

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => organizationApi.getSuppliers(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePassportForm>();


  const createMutation = useMutation({
    mutationFn: (data: CreatePassportForm) => passportApi.create(data as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      toast.success(t('passport.createTitle') + ' - Success!');
      navigate(`/passports/${data.id}`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create passport');
    },
  });

  const onSubmit = (data: CreatePassportForm) => {
    // Add location data
    if (deviceLocation) {
      data.locationLat = deviceLocation.lat;
      data.locationLng = deviceLocation.lng;
      if (deviceLocation.address) {
        data.currentLocation = deviceLocation.address;
      }
    }
    if (buyerLocation) {
      data.buyerAddressLat = buyerLocation.lat;
      data.buyerAddressLng = buyerLocation.lng;
      if (buyerLocation.address) {
        data.buyerAddress = buyerLocation.address;
      }
    }
    // Populate manufacturer from selected supplier
    if (data.supplierId && suppliers) {
      const selectedSupplier = suppliers.find((s: Supplier) => s.id === data.supplierId);
      if (selectedSupplier) {
        data.manufacturer = selectedSupplier.name;
      }
    }
    // Handle custom buyer country
    if (data.buyerCountry === 'OTHER' && data.customBuyerCountry) {
      data.buyerCountry = data.customBuyerCountry;
    }
    // Convert custom origin code to uppercase
    if (data.customOriginCode) {
      data.customOriginCode = data.customOriginCode.toUpperCase();
    }
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/passports"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('passport.backToPassports')}
      </Link>

      <div className="card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('passport.createTitle')}</h1>
              <p className="text-gray-600">{t('passport.createDescription')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('passport.productClassification')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('passport.productType')} *</label>
                <select
                  className="input"
                  {...register('productLine', { required: t('common.required') })}
                >
                  <option value="">{t('passport.selectProductType')}</option>
                  {productLines.map((pl) => (
                    <option key={pl} value={pl}>
                      {pl} - {t(`productTypes.${pl}`)}
                    </option>
                  ))}
                </select>
                {errors.productLine && (
                  <p className="mt-1 text-sm text-red-600">{errors.productLine.message}</p>
                )}
              </div>
              <div>
                <label className="label">{t('passport.originCountry')} *</label>
                <select
                  className="input"
                  {...register('originCode', { required: t('common.required') })}
                  onChange={(e) => {
                    setShowCustomOrigin(e.target.value === 'OTHER');
                  }}
                >
                  <option value="">{t('passport.selectOrigin')}</option>
                  {originCodes.map((oc) => (
                    <option key={oc} value={oc}>
                      {oc === 'OTHER' ? t('common.other', 'Other') : oc}
                    </option>
                  ))}
                </select>
                {errors.originCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.originCode.message}</p>
                )}
                {showCustomOrigin && (
                  <div className="mt-2">
                    <input
                      type="text"
                      className="input"
                      placeholder={t('passport.enterCountryCode', 'Enter country code (2 letters)')}
                      maxLength={2}
                      {...register('customOriginCode', {
                        required: showCustomOrigin ? t('common.required') : false,
                        pattern: {
                          value: /^[A-Za-z]{2}$/,
                          message: t('passport.countryCodeFormat', 'Must be 2 letters'),
                        },
                      })}
                    />
                    {errors.customOriginCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.customOriginCode.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('passport.deviceInformation')}</h2>
            <div>
              <label className="label">{t('passport.deviceName')} *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Automated Packaging Line"
                {...register('deviceName', { required: t('common.required') })}
              />
              {errors.deviceName && (
                <p className="mt-1 text-sm text-red-600">{errors.deviceName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('passport.deviceModel')} *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., PF-2000"
                  {...register('deviceModel', { required: t('common.required') })}
                />
                {errors.deviceModel && (
                  <p className="mt-1 text-sm text-red-600">{errors.deviceModel.message}</p>
                )}
              </div>
              <div>
                <label className="label">{t('passport.manufacturer')} *</label>
                <select
                  className="input"
                  {...register('supplierId', { required: t('common.required') })}
                >
                  <option value="">{t('passport.selectManufacturer')}</option>
                  {suppliers?.map((supplier: Supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.code} - {supplier.name}
                    </option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('passport.manufacturerPartNumber')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., LI-PF-2000-001"
                  {...register('manufacturerPartNumber')}
                />
              </div>
              <div>
                <label className="label">{t('passport.serialNumber')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., SN-123456789"
                  {...register('serialNumber')}
                />
              </div>
            </div>
          </div>

          {/* Dates & Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('passport.datesAndLocation')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('passport.manufactureDate')}</label>
                <input type="date" className="input" {...register('manufactureDate')} />
              </div>
              <div>
                <label className="label">{t('passport.warrantyExpiryDate')}</label>
                <input type="date" className="input" {...register('warrantyExpiryDate')} />
              </div>
            </div>
            <div>
              <label className="label">{t('passport.currentLocation')}</label>
              <div className="space-y-2">
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Warehouse A, Shelf 12"
                  {...register('currentLocation')}
                />
                <MapPicker
                  value={deviceLocation}
                  onChange={setDeviceLocation}
                  placeholder={t('passport.selectLocationOnMap')}
                />
              </div>
            </div>
          </div>

          {/* Buyer Information (Collapsible) */}
          <div className="space-y-4">
            <button
              type="button"
              className="flex items-center justify-between w-full text-left"
              onClick={() => setShowBuyerInfo(!showBuyerInfo)}
            >
              <h2 className="text-lg font-semibold text-gray-900">{t('buyer.title')}</h2>
              {showBuyerInfo ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {showBuyerInfo && (
              <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('buyer.companyName')}</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., ABC Manufacturing Co."
                      {...register('buyerCompany')}
                    />
                  </div>
                  <div>
                    <label className="label">{t('buyer.contactPerson')}</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., John Smith"
                      {...register('buyerContact')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('buyer.phone')}</label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="e.g., +1-555-123-4567"
                      {...register('buyerPhone')}
                    />
                  </div>
                  <div>
                    <label className="label">{t('buyer.email')}</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="e.g., john@example.com"
                      {...register('buyerEmail')}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">{t('buyer.country')}</label>
                  <select
                    className="input"
                    {...register('buyerCountry')}
                    onChange={(e) => {
                      setShowCustomBuyerCountry(e.target.value === 'OTHER');
                    }}
                  >
                    <option value="">{t('buyer.selectCountry')}</option>
                    {COUNTRY_LIST.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                    <option value="OTHER">{t('common.other', 'Other')}</option>
                  </select>
                  {showCustomBuyerCountry && (
                    <div className="mt-2">
                      <input
                        type="text"
                        className="input"
                        placeholder={t('buyer.enterCountryName', 'Enter country name')}
                        {...register('customBuyerCountry')}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">{t('buyer.address')}</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 123 Industrial Blvd, City, State 12345"
                      {...register('buyerAddress')}
                    />
                    <MapPicker
                      value={buyerLocation}
                      onChange={setBuyerLocation}
                      placeholder={t('buyer.selectBuyerLocation')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link to="/passports" className="btn-secondary">
              {t('common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? t('passport.creating') : t('passport.createPassport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
