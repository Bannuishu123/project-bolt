import { useState, useEffect } from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AccidentAlert } from '../lib/database.types';

export default function AlertHistory() {
  const [alerts, setAlerts] = useState<AccidentAlert[]>([]);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('accident_alerts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accident_alerts' },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('accident_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setAlerts(data);
    }
  };

  const updateAlertStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('accident_alerts')
      .update({
        status,
        resolved_at: status === 'Resolved' ? new Date().toISOString() : null
      })
      .eq('id', id);

    if (!error) {
      fetchAlerts();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-yellow-100 text-yellow-700';
      case 'Medium': return 'bg-orange-100 text-orange-700';
      case 'High': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'Resolved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'False Alarm': return <XCircle className="w-5 h-5 text-gray-600" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Alert History</h2>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No accident alerts recorded</p>
            <p className="text-sm">Your safety is being monitored</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(alert.status)}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Accident Detected
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(alert.created_at)}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <a
                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                  </a>
                </div>
                {alert.impact_force && (
                  <div className="text-sm text-gray-600">
                    Impact Force: <span className="font-semibold">{alert.impact_force.toFixed(1)} G</span>
                  </div>
                )}
              </div>

              {alert.status === 'Active' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'Resolved')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'False Alarm')}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    False Alarm
                  </button>
                </div>
              )}

              {alert.resolved_at && (
                <div className="mt-3 text-xs text-gray-500">
                  Resolved: {formatDate(alert.resolved_at)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
