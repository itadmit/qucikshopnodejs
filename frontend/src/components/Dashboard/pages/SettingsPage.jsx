import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הגדרות</h1>
          <p className="text-gray-600">נהל את הגדרות החנות שלך</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">הגדרות החנות</h3>
          <p className="text-gray-500">כאן תוכל לנהל את כל ההגדרות של החנות שלך</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
