import { useState, useEffect } from 'react';
import { Shield, Bell, BellOff } from 'lucide-react';
import HelmetStatus from './components/HelmetStatus';
import EmergencyContacts from './components/EmergencyContacts';
import AlertHistory from './components/AlertHistory';
import { supabase } from './lib/supabase';

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    if (isMonitoring && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isMonitoring]);

  const showAlert = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleAccidentDetected = async () => {
    if (!location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          triggerAccident(position.coords.latitude, position.coords.longitude);
        },
        () => {
          triggerAccident(37.7749, -122.4194);
        }
      );
    } else {
      triggerAccident(location.latitude, location.longitude);
    }
  };

  const triggerAccident = async (lat: number, lng: number) => {
    const impactForce = Math.random() * 10 + 5;
    const severity = impactForce > 12 ? 'High' : impactForce > 8 ? 'Medium' : 'Low';

    const { data: contacts } = await supabase
      .from('emergency_contacts')
      .select('*');

    const contactIds = contacts?.map(c => c.id) || [];

    const { error } = await supabase
      .from('accident_alerts')
      .insert([{
        latitude: lat,
        longitude: lng,
        severity,
        impact_force: impactForce,
        alerted_contacts: contactIds,
        status: 'Active'
      }]);

    if (!error) {
      showAlert(
        `🚨 ACCIDENT DETECTED! Location: ${lat.toFixed(4)}, ${lng.toFixed(4)} | ${contacts?.length || 0} contacts notified`
      );

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-2xl">
            <Bell className="w-6 h-6 animate-pulse" />
            <span className="font-semibold">{notificationMessage}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Smart Helmet</h1>
                <p className="text-gray-600">Real-time accident detection and emergency alert system</p>
              </div>
            </div>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-lg transition-all shadow-lg ${
                isMonitoring
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              }`}
            >
              {isMonitoring ? (
                <>
                  <BellOff className="w-6 h-6" />
                  <span>Stop Monitoring</span>
                </>
              ) : (
                <>
                  <Bell className="w-6 h-6" />
                  <span>Start Monitoring</span>
                </>
              )}
            </button>
          </div>

          {location && isMonitoring && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-blue-800">
                Live Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <HelmetStatus
            onAccidentDetected={handleAccidentDetected}
            isMonitoring={isMonitoring}
          />
          <EmergencyContacts />
        </div>

        <AlertHistory />
      </div>
    </div>
  );
}

export default App;
