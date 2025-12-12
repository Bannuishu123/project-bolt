import { useState, useEffect } from 'react';
import { UserPlus, Phone, Mail, Trash2, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { EmergencyContact } from '../lib/database.types';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Family',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContacts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('emergency_contacts')
      .insert([formData]);

    if (!error) {
      setFormData({ name: '', phone: '', email: '', relationship: 'Family' });
      setShowForm(false);
      fetchContacts();
    }

    setLoading(false);
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchContacts();
    }
  };

  const togglePrimary = async (id: string, currentPrimary: boolean) => {
    if (!currentPrimary) {
      await supabase
        .from('emergency_contacts')
        .update({ is_primary: false })
        .neq('id', id);
    }

    const { error } = await supabase
      .from('emergency_contacts')
      .update({ is_primary: !currentPrimary })
      .eq('id', id);

    if (!error) {
      fetchContacts();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Emergency Contacts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Contact</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Doctor">Doctor</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No emergency contacts added yet</p>
            <p className="text-sm">Add contacts to receive accident alerts</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {contact.relationship}
                  </span>
                  {contact.is_primary && (
                    <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePrimary(contact.id, contact.is_primary)}
                  className={`p-2 rounded-lg transition-colors ${
                    contact.is_primary
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title="Toggle primary contact"
                >
                  <Star className={`w-5 h-5 ${contact.is_primary ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="Delete contact"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
