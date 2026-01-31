'use client';

import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Plus, Download, ArrowUpDown, CheckCircle2, Clock, XCircle, DollarSign } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';

interface Charge {
  id: string;
  charge_type: 'event' | 'membership_dues' | 'one_off' | 'other';
  title: string;
  member_name: string | null;
  member_email: string | null;
  amount: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  payment_method: string | null;
  payment_date: string | null;
  due_date: string | null;
  event_date: string | null;
  transaction_type: 'charge' | 'expense';
}

interface LedgerSummary {
  total_charges: number;
  total_charges_paid: number;
  total_charges_unpaid: number;
  total_expenses: number;
  total_expenses_covered: number;
  total_expenses_uncovered: number;
  net_balance: number;
  total_paid: number;
  total_pending: number;
  paid_count: number;
  pending_count: number;
}

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-sunburst-100 text-sunburst-700 rounded">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }

  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-wine-light text-wine-dark rounded">
        <CheckCircle2 className="w-3 h-3" />
        Paid
      </span>
    );
  }

  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
        <XCircle className="w-3 h-3" />
        Cancelled
      </span>
    );
  }

  if (status === 'refunded') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-sunburst-200 text-sunburst-800 rounded">
        <XCircle className="w-3 h-3" />
        Refunded
      </span>
    );
  }

  return null;
};

const ChargeTypeForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  members: Array<{ id: string; name: string; email: string }>;
}> = ({ onSubmit, onCancel, isLoading, members }) => {
  console.log('[ChargeTypeForm] Rendering with members count:', members?.length || 0);

  const [formData, setFormData] = useState({
    transaction_type: 'charge' as 'charge' | 'expense',
    charge_type: 'membership_dues' as 'membership_dues' | 'one_off' | 'other',
    title: '',
    description: '',
    amount: '',
    due_date: '',
    apply_to: 'all' as 'all' | 'specific',
    member_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[ChargeTypeForm] Form submitted with data:', formData);
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      member_id: formData.apply_to === 'all' ? null : formData.member_id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction Type
        </label>
        <select
          value={formData.transaction_type}
          onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as any })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          required
        >
          <option value="charge">Charge (money owed to club)</option>
          <option value="expense">Expense (money club owes to member)</option>
        </select>
      </div>

      {formData.transaction_type === 'charge' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Charge Type
          </label>
          <select
            value={formData.charge_type}
            onChange={(e) => setFormData({ ...formData, charge_type: e.target.value as any })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            required
          >
            <option value="membership_dues">Membership Dues</option>
            <option value="one_off">One-Off Charge</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder={formData.transaction_type === 'charge' ? 'e.g., Monthly Membership Fee' : 'e.g., Wine purchase for tasting event'}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date (optional)
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {formData.transaction_type === 'charge' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apply To
            </label>
            <select
              value={formData.apply_to}
              onChange={(e) => setFormData({ ...formData, apply_to: e.target.value as 'all' | 'specific' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Members</option>
              <option value="specific">Specific Member</option>
            </select>
          </div>

          {formData.apply_to === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Member
              </label>
              <select
                value={formData.member_id}
                onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="">Choose a member...</option>
                {(members || []).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>
          <select
            value={formData.member_id}
            onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            required
          >
            <option value="">Choose who paid...</option>
            {(members || []).map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : formData.transaction_type === 'charge' ? 'Create Charge' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export const LedgerTab: React.FC = () => {
  console.log('[LedgerTab] Component render');

  const [charges, setCharges] = useState<Charge[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = useState<string>('unpaid_uncovered'); // Default to showing only unpaid/uncovered
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  const fetchLedgerData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/host/ledger');
      if (response.ok) {
        const data = await response.json();
        setCharges(data.charges || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      console.log('[LedgerTab] Fetching members...');
      const response = await fetch('/api/host/members');
      console.log('[LedgerTab] Members response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[LedgerTab] Members data:', data);

        if (data.members && Array.isArray(data.members)) {
          const formattedMembers = data.members.map((m: any) => ({
            id: m.user_id,
            name: m.full_name || 'Unknown',
            email: m.email || 'No email',
          }));
          console.log('[LedgerTab] Formatted members:', formattedMembers.length, 'members');
          setMembers(formattedMembers);
        } else {
          console.error('[LedgerTab] Invalid members data structure:', data);
          setMembers([]);
        }
      } else {
        console.error('[LedgerTab] Failed to fetch members, status:', response.status);
        setMembers([]);
      }
    } catch (error) {
      console.error('[LedgerTab] Error fetching members:', error);
      setMembers([]);
    }
  };

  useEffect(() => {
    console.log('[LedgerTab] useEffect running - fetching data');
    fetchLedgerData();
    fetchMembers();
  }, []);

  const columnHelper = createColumnHelper<Charge>();

  const columns = [
    columnHelper.accessor('member_name', {
      header: 'User',
      cell: (info) => {
        const value = info.getValue();
        return <div className="font-medium text-gray-900">{value || 'All Members'}</div>;
      },
    }),
    columnHelper.accessor('title', {
      header: 'Description',
      cell: (info) => <div className="text-sm text-gray-700">{info.getValue()}</div>,
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => {
        const isExpense = info.row.original.transaction_type === 'expense';
        return (
          <div className={`font-medium ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
            {isExpense ? '-' : '+'}${info.getValue().toFixed(2)}
          </div>
        );
      },
    }),
    columnHelper.accessor('transaction_type', {
      header: 'Type',
      cell: (info) => {
        const isExpense = info.getValue() === 'expense';
        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
            isExpense ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isExpense ? 'Expense' : 'Charge'}
          </span>
        );
      },
    }),
    columnHelper.accessor('payment_status', {
      header: 'Status',
      cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
    }),
  ];

  const filteredData = charges.filter((charge) => {
    // Status filter with special handling for unpaid/uncovered
    if (statusFilter === 'unpaid_uncovered') {
      if (charge.payment_status !== 'pending') return false;
    } else if (statusFilter !== 'all' && charge.payment_status !== statusFilter) {
      return false;
    }

    // Transaction type filter
    if (typeFilter === 'charge' && charge.transaction_type !== 'charge') return false;
    if (typeFilter === 'expense' && charge.transaction_type !== 'expense') return false;

    return true;
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleExportCSV = () => {
    const headers = ['User', 'Description', 'Amount', 'Type', 'Status'];
    const rows = filteredData.map((charge) => [
      charge.member_name || 'All Members',
      charge.title,
      `${charge.transaction_type === 'expense' ? '-' : '+'}$${charge.amount.toFixed(2)}`,
      charge.transaction_type === 'expense' ? 'Expense' : 'Charge',
      charge.payment_status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateCharge = async (data: any) => {
    try {
      setIsSubmitting(true);

      // For expenses, ensure charge_type is set and member_id is required
      const payload = {
        ...data,
        charge_type: data.transaction_type === 'expense' ? 'other' : data.charge_type,
        member_id: data.transaction_type === 'expense' ? data.member_id : (data.apply_to === 'all' ? null : data.member_id),
      };

      const response = await fetch('/api/host/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        fetchLedgerData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create entry');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-wine to-wine-dark rounded-lg p-8 text-white">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <DollarSign className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold mb-1">Financial Ledger</h2>
              <p className="text-wine-light">Track all payments, dues, and charges</p>
            </div>
          </div>
          <button
            onClick={() => {
              console.log('[LedgerTab] Create button clicked');
              console.log('[LedgerTab] Current members state:', members);
              setIsCreateDialogOpen(true);
            }}
            className="bg-white text-wine-dark hover:bg-wine-light hover:text-wine-dark px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
          >
            <Plus size={20} />
            Create
          </button>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-6 pt-6 border-t border-wine-light/30">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-wine-light text-sm mb-1">Total Charges</p>
                <p className="text-xl font-bold text-green-100">+${summary.total_charges.toFixed(2)}</p>
                <p className="text-xs text-wine-light mt-1">${summary.total_charges_unpaid.toFixed(2)} unpaid</p>
              </div>
              <div>
                <p className="text-wine-light text-sm mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-100">-${summary.total_expenses.toFixed(2)}</p>
                <p className="text-xs text-wine-light mt-1">${summary.total_expenses_uncovered.toFixed(2)} uncovered</p>
              </div>
              <div>
                <p className="text-wine-light text-sm mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${summary.net_balance >= 0 ? 'text-white' : 'text-red-200'}`}>
                  {summary.net_balance >= 0 ? '+' : ''}${summary.net_balance.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-wine-light text-sm mb-1">Outstanding</p>
                <p className="text-xl font-bold text-sunburst-200">${(summary.total_charges_unpaid + summary.total_expenses_uncovered).toFixed(2)}</p>
                <p className="text-xs text-wine-light mt-1">{summary.pending_count} pending</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-wine-light rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="unpaid_uncovered">Unpaid/Uncovered Only</option>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-wine-light rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Types</option>
            <option value="charge">Charges Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-wine">Loading ledger...</div>
      ) : (
        <div className="bg-white border border-wine-light rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-wine-light/20">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-wine-dark uppercase tracking-wider cursor-pointer hover:bg-wine-light/30"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      No charges found. Create a charge or event to get started.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Charge Dialog */}
      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Add Ledger Entry"
        maxWidth="md"
      >
        <ChargeTypeForm
          onSubmit={handleCreateCharge}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
          members={members}
        />
      </Dialog>
    </div>
  );
};
