import { BarChart3 } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">אנליטיקה</h1>
          <p className="text-gray-600">צפה בנתונים ובדוחות</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין נתונים עדיין</h3>
          <p className="text-gray-500">הנתונים והדוחות יופיעו כאן כשתתחיל לקבל הזמנות</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
