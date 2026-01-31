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
import { DollarSign, ArrowUpDown, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Charge {
  id: string;
  charge_type: 'event' | 'membership_dues' | 'one_off' | 'other';
  title: string;
  description: string | null;
  host_name: string;
  host_code: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  payment_method: string | null;
  payment_date: string | null;
  due_date: string | null;
  event_date: string | null;
}

interface DuesSummary {
  total_owed: number;
  total_paid: number;
  pending_count: number;
  overdue_count: number;
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

export default function MemberDuesView() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [summary, setSummary] = useState<DuesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchDuesData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/member/dues');
      if (response.ok) {
        const data = await response.json();
        setCharges(data.charges || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Error fetching dues data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuesData();
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
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          {info.row.original.description && (
            <div className="text-xs text-gray-500 mt-1">{info.row.original.description}</div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('host_name', {
      header: 'Club',
      cell: (info) => (
        <Link
          href={`/clubs/${info.row.original.host_code}`}
          className="text-sm text-wine hover:text-wine-dark hover:underline"
        >
          {info.getValue()}'s Club
        </Link>
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => <div className="font-medium">${info.getValue().toFixed(2)}</div>,
    }),
    columnHelper.accessor('payment_status', {
      header: 'Status',
      cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('due_date', {
      header: 'Due Date',
      cell: (info) => {
        const value = info.getValue() || info.row.original.event_date;
        if (!value) return '-';

        const dueDate = new Date(value);
        const isOverdue = dueDate < new Date() && info.row.original.payment_status === 'pending';

        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
            {isOverdue && <AlertCircle className="w-3 h-3 inline mr-1" />}
            {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        );
      },
    }),
  ];

  const filteredData = charges.filter((charge) => {
    if (statusFilter !== 'all' && charge.payment_status !== statusFilter) return false;
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-wine to-wine-dark rounded-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <DollarSign className="w-12 h-12" />
          <div>
            <h2 className="text-2xl font-bold mb-1">Dues and Charges</h2>
            <p className="text-wine-light">View and track your club payments</p>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-6 pt-6 border-t border-wine-light/30 grid grid-cols-3 gap-4">
            <div>
              <p className="text-wine-light text-sm mb-1">Total Owed</p>
              <p className="text-2xl font-bold">${summary.total_owed.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-wine-light text-sm mb-1">Paid This Year</p>
              <p className="text-2xl font-bold text-green-300">${summary.total_paid.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-wine-light text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-300">
                {summary.pending_count} {summary.pending_count === 1 ? 'charge' : 'charges'}
              </p>
              {summary.overdue_count > 0 && (
                <p className="text-sm text-red-300 mt-1">
                  {summary.overdue_count} overdue
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">How to Pay</h3>
            <p className="text-sm text-blue-800">
              Contact your club host to arrange payment via their preferred method (Venmo, PayPal, Zelle, or Cash).
              Once you've paid, the host will update the status here.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-wine-light rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Charges</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-wine">Loading dues...</div>
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
                      No charges found. You're all caught up!
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
    </div>
  );
}
