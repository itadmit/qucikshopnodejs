import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Package, 
  DollarSign,
  Weight,
  MapPin,
  Settings,
  Info,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';

const ShippingPage = () => {
  const { t } = useTranslation();
  const [shippingZones, setShippingZones] = useState([]);
  const [showAddZone, setShowAddZone] = useState(false);
  const [expandedZone, setExpandedZone] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [generalSettings, setGeneralSettings] = useState({
    freeShippingThreshold: 200,
    defaultShippingRate: 15,
    weightUnit: 'kg',
    dimensionUnit: 'cm'
  });

  useEffect(() => {
    loadShippingSettings();
  }, []);

  const loadShippingSettings = () => {
    // Load from localStorage or API
    const savedSettings = localStorage.getItem('shippingSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setShippingZones(settings.zones || []);
      setGeneralSettings(settings.general || generalSettings);
    } else {
      // Default zones
      setShippingZones([
        {
          id: 'israel',
          name: 'ישראל',
          countries: ['IL'],
          rates: [
            {
              id: 'standard',
              name: 'משלוח רגיל',
              price: 15,
              freeAbove: 200,
              conditions: {
                minWeight: 0,
                maxWeight: 30,
                minPrice: 0,
                maxPrice: null
              },
              deliveryTime: '3-5 ימי עסקים'
            },
            {
              id: 'express',
              name: 'משלוח מהיר',
              price: 25,
              freeAbove: null,
              conditions: {
                minWeight: 0,
                maxWeight: 10,
                minPrice: 0,
                maxPrice: null
              },
              deliveryTime: '1-2 ימי עסקים'
            }
          ]
        }
      ]);
    }
  };

  const saveShippingSettings = () => {
    const settings = {
      zones: shippingZones,
      general: generalSettings
    };
    localStorage.setItem('shippingSettings', JSON.stringify(settings));
    
    // Show success message
    alert('הגדרות המשלוח נשמרו בהצלחה!');
  };

  const addShippingZone = (zoneName, countries) => {
    const newZone = {
      id: Date.now().toString(),
      name: zoneName,
      countries: countries,
      rates: []
    };
    setShippingZones([...shippingZones, newZone]);
    setShowAddZone(false);
  };

  const deleteShippingZone = (zoneId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את אזור המשלוח הזה?')) {
      setShippingZones(shippingZones.filter(zone => zone.id !== zoneId));
    }
  };

  const addShippingRate = (zoneId) => {
    const newRate = {
      id: Date.now().toString(),
      name: 'שיטת משלוח חדשה',
      price: 0,
      freeAbove: null,
      conditions: {
        minWeight: 0,
        maxWeight: null,
        minPrice: 0,
        maxPrice: null
      },
      deliveryTime: ''
    };
    
    setShippingZones(zones => zones.map(zone => 
      zone.id === zoneId 
        ? { ...zone, rates: [...zone.rates, newRate] }
        : zone
    ));
    setEditingRate({ zoneId, rateId: newRate.id });
  };

  const updateShippingRate = (zoneId, rateId, updatedRate) => {
    setShippingZones(zones => zones.map(zone => 
      zone.id === zoneId 
        ? { 
            ...zone, 
            rates: zone.rates.map(rate => 
              rate.id === rateId ? { ...rate, ...updatedRate } : rate
            )
          }
        : zone
    ));
  };

  const deleteShippingRate = (zoneId, rateId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את שיטת המשלוח הזו?')) {
      setShippingZones(zones => zones.map(zone => 
        zone.id === zoneId 
          ? { ...zone, rates: zone.rates.filter(rate => rate.id !== rateId) }
          : zone
      ));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(price);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">הגדרות משלוחים</h1>
            <p className="text-gray-600">נהל את שיטות המשלוח, תעריפים ואזורי משלוח</p>
          </div>
          <button
            onClick={saveShippingSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 ml-2" />
            שמור הגדרות
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 ml-2" />
            הגדרות כלליות
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סכום למשלוח חינם
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={generalSettings.freeShippingThreshold}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    freeShippingThreshold: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="200"
                />
                <span className="absolute left-3 top-2 text-gray-500">₪</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תעריף משלוח ברירת מחדל
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={generalSettings.defaultShippingRate}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    defaultShippingRate: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                />
                <span className="absolute left-3 top-2 text-gray-500">₪</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                יחידת משקל
              </label>
              <select
                value={generalSettings.weightUnit}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  weightUnit: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">קילוגרם (kg)</option>
                <option value="g">גרם (g)</option>
                <option value="lb">פאונד (lb)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                יחידת מידות
              </label>
              <select
                value={generalSettings.dimensionUnit}
                onChange={(e) => setGeneralSettings({
                  ...generalSettings,
                  dimensionUnit: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cm">סנטימטר (cm)</option>
                <option value="m">מטר (m)</option>
                <option value="in">אינץ' (in)</option>
                <option value="ft">רגל (ft)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Zones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 ml-2" />
              אזורי משלוח
            </h2>
            <button
              onClick={() => setShowAddZone(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף אזור משלוח
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {shippingZones.map((zone) => (
            <ShippingZoneCard
              key={zone.id}
              zone={zone}
              expanded={expandedZone === zone.id}
              onToggleExpand={() => setExpandedZone(expandedZone === zone.id ? null : zone.id)}
              onDelete={() => deleteShippingZone(zone.id)}
              onAddRate={() => addShippingRate(zone.id)}
              onUpdateRate={(rateId, updatedRate) => updateShippingRate(zone.id, rateId, updatedRate)}
              onDeleteRate={(rateId) => deleteShippingRate(zone.id, rateId)}
              editingRate={editingRate}
              setEditingRate={setEditingRate}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddZone && (
        <AddZoneModal
          onClose={() => setShowAddZone(false)}
          onAdd={addShippingZone}
        />
      )}
    </div>
  );
};

// Shipping Zone Card Component
const ShippingZoneCard = ({ 
  zone, 
  expanded, 
  onToggleExpand, 
  onDelete, 
  onAddRate, 
  onUpdateRate, 
  onDeleteRate,
  editingRate,
  setEditingRate,
  formatPrice 
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onToggleExpand}
            className="flex items-center text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            {zone.name}
          </button>
          <span className="mr-3 text-sm text-gray-500">
            ({zone.countries.join(', ')}) • {zone.rates.length} שיטות משלוח
          </span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={onAddRate}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {zone.rates.map((rate) => (
            <ShippingRateCard
              key={rate.id}
              rate={rate}
              zoneId={zone.id}
              editing={editingRate?.zoneId === zone.id && editingRate?.rateId === rate.id}
              onEdit={() => setEditingRate({ zoneId: zone.id, rateId: rate.id })}
              onSave={(updatedRate) => {
                onUpdateRate(rate.id, updatedRate);
                setEditingRate(null);
              }}
              onCancel={() => setEditingRate(null)}
              onDelete={() => onDeleteRate(rate.id)}
              formatPrice={formatPrice}
            />
          ))}
          
          {zone.rates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>אין שיטות משלוח באזור זה</p>
              <button
                onClick={onAddRate}
                className="mt-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                הוסף שיטת משלוח ראשונה
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Shipping Rate Card Component
const ShippingRateCard = ({ 
  rate, 
  zoneId, 
  editing, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  formatPrice 
}) => {
  const [editedRate, setEditedRate] = useState(rate);

  useEffect(() => {
    setEditedRate(rate);
  }, [rate, editing]);

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם שיטת המשלוח</label>
            <input
              type="text"
              value={editedRate.name}
              onChange={(e) => setEditedRate({ ...editedRate, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מחיר</label>
            <div className="relative">
              <input
                type="number"
                value={editedRate.price}
                onChange={(e) => setEditedRate({ ...editedRate, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2 text-gray-500">₪</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">משלוח חינם מעל</label>
            <div className="relative">
              <input
                type="number"
                value={editedRate.freeAbove || ''}
                onChange={(e) => setEditedRate({ ...editedRate, freeAbove: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="אופציונלי"
              />
              <span className="absolute left-3 top-2 text-gray-500">₪</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">זמן אספקה</label>
            <input
              type="text"
              value={editedRate.deliveryTime}
              onChange={(e) => setEditedRate({ ...editedRate, deliveryTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="למשל: 3-5 ימי עסקים"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">משקל מינימלי</label>
            <div className="relative">
              <input
                type="number"
                value={editedRate.conditions.minWeight}
                onChange={(e) => setEditedRate({ 
                  ...editedRate, 
                  conditions: { ...editedRate.conditions, minWeight: parseFloat(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2 text-gray-500">ק"ג</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">משקל מקסימלי</label>
            <div className="relative">
              <input
                type="number"
                value={editedRate.conditions.maxWeight || ''}
                onChange={(e) => setEditedRate({ 
                  ...editedRate, 
                  conditions: { ...editedRate.conditions, maxWeight: e.target.value ? parseFloat(e.target.value) : null }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="אופציונלי"
              />
              <span className="absolute left-3 top-2 text-gray-500">ק"ג</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 space-x-reverse mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={() => onSave(editedRate)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            שמור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{rate.name}</h4>
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">מחיר: </span>
              {formatPrice(rate.price)}
            </div>
            {rate.freeAbove && (
              <div>
                <span className="font-medium">חינם מעל: </span>
                {formatPrice(rate.freeAbove)}
              </div>
            )}
            {rate.deliveryTime && (
              <div>
                <span className="font-medium">זמן אספקה: </span>
                {rate.deliveryTime}
              </div>
            )}
            <div>
              <span className="font-medium">משקל: </span>
              {rate.conditions.minWeight}
              {rate.conditions.maxWeight ? `-${rate.conditions.maxWeight}` : '+'} ק"ג
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Zone Modal Component
const AddZoneModal = ({ onClose, onAdd }) => {
  const [zoneName, setZoneName] = useState('');
  const [selectedCountries, setSelectedCountries] = useState(['IL']);

  const countries = [
    { code: 'IL', name: 'ישראל' },
    { code: 'US', name: 'ארצות הברית' },
    { code: 'GB', name: 'בריטניה' },
    { code: 'DE', name: 'גרמניה' },
    { code: 'FR', name: 'צרפת' },
    { code: 'CA', name: 'קנדה' },
    { code: 'AU', name: 'אוסטרליה' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (zoneName.trim() && selectedCountries.length > 0) {
      onAdd(zoneName.trim(), selectedCountries);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">הוסף אזור משלוח חדש</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם האזור
            </label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="למשל: אירופה"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מדינות
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {countries.map((country) => (
                <label key={country.code} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCountries([...selectedCountries, country.code]);
                      } else {
                        setSelectedCountries(selectedCountries.filter(c => c !== country.code));
                      }
                    }}
                    className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{country.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              הוסף אזור
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingPage; 