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
}

interface LedgerSummary {
  total_charges: number;
  total_paid: number;
  total_pending: number;
  paid_count: number;
  pending_count: number;
}

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }

  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
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
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
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
  const [formData, setFormData] = useState({
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder="e.g., Monthly Membership Fee"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          rows={2}
          placeholder="Additional details about this charge"
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
            {members.map((member) => (
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
          {isLoading ? 'Creating...' : 'Create Charge'}
        </button>
      </div>
    </form>
  );
};

export const LedgerTab: React.FC = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
      const response = await fetch('/api/host/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(
          data.members.map((m: any) => ({
            id: m.user_id,
            name: m.full_name,
            email: m.email,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  useEffect(() => {
    fetchLedgerData();
    fetchMembers();
  }, []);

  const columnHelper = createColumnHelper<Charge>();

  const columns = [
    columnHelper.accessor('charge_type', {
      header: 'Type',
      cell: (info) => (
        <div className="text-sm capitalize">
          {info.getValue().replace(/_/g, ' ')}
        </div>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Description',
      cell: (info) => <div className="font-medium text-gray-900">{info.getValue()}</div>,
    }),
    columnHelper.accessor('member_name', {
      header: 'Member',
      cell: (info) => {
        const value = info.getValue();
        return <div className="text-sm">{value || 'All Members'}</div>;
      },
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => <div className="font-medium">${info.getValue().toFixed(2)}</div>,
    }),
    columnHelper.accessor('payment_status', {
      header: 'Status',
      cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('payment_method', {
      header: 'Method',
      cell: (info) => {
        const value = info.getValue();
        return (
          <div className="text-sm capitalize">
            {value ? value : '-'}
          </div>
        );
      },
    }),
    columnHelper.accessor('due_date', {
      header: 'Due',
      cell: (info) => {
        const value = info.getValue() || info.row.original.event_date;
        return value ? (
          <div className="text-sm">
            {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        ) : (
          '-'
        );
      },
    }),
    columnHelper.accessor('payment_date', {
      header: 'Paid',
      cell: (info) => {
        const value = info.getValue();
        return value ? (
          <div className="text-sm">
            {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        ) : (
          '-'
        );
      },
    }),
  ];

  const filteredData = charges.filter((charge) => {
    if (statusFilter !== 'all' && charge.payment_status !== statusFilter) return false;
    if (typeFilter !== 'all' && charge.charge_type !== typeFilter) return false;
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
    const headers = ['Type', 'Description', 'Member', 'Amount', 'Status', 'Method', 'Due Date', 'Paid Date'];
    const rows = filteredData.map((charge) => [
      charge.charge_type.replace(/_/g, ' '),
      charge.title,
      charge.member_name || 'All Members',
      `$${charge.amount.toFixed(2)}`,
      charge.payment_status,
      charge.payment_method || '-',
      charge.due_date || charge.event_date || '-',
      charge.payment_date ? new Date(charge.payment_date).toLocaleDateString() : '-',
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
      const response = await fetch('/api/host/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        fetchLedgerData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create charge');
      }
    } catch (error) {
      console.error('Error creating charge:', error);
      alert('Failed to create charge');
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
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-white text-wine-dark hover:bg-wine-light hover:text-wine-dark px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
          >
            <Plus size={20} />
            New Charge
          </button>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-6 pt-6 border-t border-wine-light/30 grid grid-cols-3 gap-4">
            <div>
              <p className="text-wine-light text-sm mb-1">Total Charged</p>
              <p className="text-2xl font-bold">${summary.total_charges.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-wine-light text-sm mb-1">Collected</p>
              <p className="text-2xl font-bold text-green-300">${summary.total_paid.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-wine-light text-sm mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-300">${summary.total_pending.toFixed(2)}</p>
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
            <option value="event">Event</option>
            <option value="membership_dues">Membership Dues</option>
            <option value="one_off">One-Off</option>
            <option value="other">Other</option>
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
        title="Create New Charge"
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
