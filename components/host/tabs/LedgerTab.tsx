import React from 'react';
import { DollarSign, TrendingUp, Receipt, Calendar } from 'lucide-react';

export const LedgerTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Receipt className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Financial Ledger</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          This feature is coming soon! You'll be able to track payments from members,
          record expenses, and manage your club's finances.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          <Calendar className="w-4 h-4" />
          Coming Soon
        </div>
      </div>

      {/* Placeholder Feature List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Payment Tracking</h3>
          <p className="text-sm text-gray-600">
            Track payments from members for events, wine purchases, and membership dues
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Receipt className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Expense Management</h3>
          <p className="text-sm text-gray-600">
            Record wine purchases, venue costs, and other club expenses
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Financial Reports</h3>
          <p className="text-sm text-gray-600">
            View summaries and reports of your club's financial activity
          </p>
        </div>
      </div>
    </div>
  );
};
