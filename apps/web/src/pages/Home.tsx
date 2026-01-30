import { Link } from 'react-router-dom';
import { QrCode, Shield, Clock, Wrench, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'Digital Passport',
    description: 'Every device gets a unique digital passport with full lifecycle tracking.',
  },
  {
    icon: Shield,
    title: 'Authentic Verification',
    description: 'Verify device authenticity instantly by scanning the QR code.',
  },
  {
    icon: Clock,
    title: 'Full Traceability',
    description: 'Track device history from procurement to service, every step recorded.',
  },
  {
    icon: Wrench,
    title: 'Service Management',
    description: 'Request service and track maintenance history for your equipment.',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Device Passport Traceability System
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Full lifecycle management for electromechanical automation equipment.
              Scan, verify, and track your devices with confidence.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/scan" className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3">
                <QrCode className="h-5 w-5 mr-2" />
                Scan Device
              </Link>
              <Link
                to="/service-request"
                className="btn bg-primary-500 text-white hover:bg-primary-400 px-6 py-3"
              >
                Request Service
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
              Complete Device Lifecycle Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From procurement to service, every step is tracked and verified.
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Device Lifecycle Status</h2>
            <p className="text-lg text-gray-600">Track your device through every stage</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Created',
              'Procured',
              'QC',
              'Assembly',
              'Testing',
              'Packaged',
              'In Transit',
              'Delivered',
              'In Service',
            ].map((status, index, arr) => (
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
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
              Scan a device QR code to verify its authenticity and view its complete history.
            </p>
            <Link to="/scan" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3">
              Start Scanning
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
