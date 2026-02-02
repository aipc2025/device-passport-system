import { Link } from 'react-router-dom';
import { QrCode, Shield, Clock, Wrench, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: QrCode,
      title: t('home.feature1Title'),
      description: t('home.feature1Desc'),
    },
    {
      icon: Shield,
      title: t('home.feature2Title'),
      description: t('home.feature2Desc'),
    },
    {
      icon: Clock,
      title: t('home.feature3Title'),
      description: t('home.feature3Desc'),
    },
    {
      icon: Wrench,
      title: t('home.feature4Title'),
      description: t('home.feature4Desc'),
    },
  ];

  const statuses = [
    t('home.statusCreated'),
    t('home.statusProcured'),
    t('home.statusQC'),
    t('home.statusAssembly'),
    t('home.statusTesting'),
    t('home.statusPackaged'),
    t('home.statusInTransit'),
    t('home.statusDelivered'),
    t('home.statusInService'),
  ];

  return (
    <>
      <Helmet>
        <title>{t('home.pageTitle', 'Device Passport System - B2B Equipment Lifecycle Management')}</title>
        <meta name="description" content={t('home.pageDescription', 'B2B Device Passport Traceability System for equipment lifecycle management with digital QR code tracking')} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={t('home.pageTitle', 'Device Passport System - B2B Equipment Lifecycle Management')} />
        <meta property="og:description" content={t('home.pageDescription', 'B2B Device Passport Traceability System for equipment lifecycle management with digital QR code tracking')} />
        <meta property="og:image" content="/luna-logo.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={t('home.pageTitle', 'Device Passport System - B2B Equipment Lifecycle Management')} />
        <meta property="twitter:description" content={t('home.pageDescription', 'B2B Device Passport Traceability System for equipment lifecycle management with digital QR code tracking')} />
        <meta property="twitter:image" content="/luna-logo.png" />

        {/* Additional SEO */}
        <meta name="keywords" content="device passport, equipment lifecycle, traceability, QR code, B2B, asset management" />
        <meta name="author" content="LUNA INDUSTRY" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/scan" className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3">
                <QrCode className="h-5 w-5 mr-2" />
                {t('home.scanDevice')}
              </Link>
              <Link
                to="/service-request"
                className="btn bg-primary-500 text-white hover:bg-primary-400 px-6 py-3"
              >
                {t('home.requestService')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.featuresTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Flow Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.statusTitle')}</h2>
            <p className="text-lg text-gray-600">{t('home.statusSubtitle')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {statuses.map((status, index, arr) => (
              <div key={status} className="flex items-center">
                <span className="badge-info px-3 py-1">{status}</span>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-primary-600 p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
              {t('home.ctaSubtitle')}
            </p>
            <Link to="/scan" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3">
              {t('home.ctaButton')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
