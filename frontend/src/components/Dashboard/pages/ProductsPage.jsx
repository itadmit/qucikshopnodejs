import { Package, Plus } from 'lucide-react';

const ProductsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">מוצרים</h1>
          <p className="text-gray-600">נהל את המוצרים שלך</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          הוסף מוצר
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין מוצרים עדיין</h3>
          <p className="text-gray-500 mb-6">התחל בהוספת המוצר הראשון שלך</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <Plus className="w-4 h-4" />
            הוסף מוצר ראשון
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
