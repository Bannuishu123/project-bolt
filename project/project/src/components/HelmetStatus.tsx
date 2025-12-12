import { Shield, AlertTriangle, Wifi, Battery } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HelmetStatusProps {
  onAccidentDetected: () => void;
  isMonitoring: boolean;
}

export default function HelmetStatus({ onAccidentDetected, isMonitoring }: HelmetStatusProps) {
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev - Math.random() * 0.5));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Smart Helmet Status</h2>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          isMonitoring ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-sm font-medium">
            {isMonitoring ? 'Monitoring' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wifi className={`w-6 h-6 ${isConnected ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="font-semibold text-gray-700">Connection</span>
          </div>
          <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Battery className={`w-6 h-6 ${
              batteryLevel > 50 ? 'text-green-600' : batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
            }`} />
            <span className="font-semibold text-gray-700">Battery</span>
          </div>
          <p className="text-sm text-gray-600">{batteryLevel.toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-8 text-white text-center">
        <Shield className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Impact Detection System</h3>
        <p className="text-sm opacity-90 mb-6">
          Continuously monitoring for sudden impacts and falls
        </p>

        <button
          onClick={onAccidentDetected}
          disabled={!isMonitoring}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
            isMonitoring
              ? 'bg-white text-red-600 hover:bg-gray-100 hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <span>Simulate Accident Detection</span>
          </div>
        </button>

        {!isMonitoring && (
          <p className="text-xs mt-3 opacity-75">
            Start monitoring to enable accident detection
          </p>
        )}
      </div>
    </div>
  );
}
