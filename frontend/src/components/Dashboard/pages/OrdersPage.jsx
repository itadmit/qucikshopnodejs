import { ShoppingCart } from 'lucide-react';

const OrdersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הזמנות</h1>
          <p className="text-gray-600">נהל את ההזמנות שלך</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין הזמנות עדיין</h3>
          <p className="text-gray-500">ההזמנות יופיעו כאן כשלקוחות יזמינו מהחנות שלך</p>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
