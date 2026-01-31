'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Download, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface EventLedgerAttendee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  rsvp_status: string;
  payment_id: string | null;
  payment_status: 'pending' | 'paid' | 'refunded' | 'cancelled' | null;
  payment_amount: number | null;
  payment_method: 'venmo' | 'paypal' | 'zelle' | 'cash' | 'other' | null;
  payment_date: string | null;
}

interface EventLedgerData {
  event_id: string;
  event_title: string;
  event_date: string;
  event_price: number | null;
  total_attendees: number;
  paid_count: number;
  total_collected: number;
  total_expected: number;
  attendees: EventLedgerAttendee[];
}

interface EventLedgerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const PaymentStatusBadge: React.FC<{ status: string | null }> = ({ status }) => {
  if (!status || status === 'pending') {
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

const PaymentMethodCell: React.FC<{
  value: string | null;
  paymentId: string | null;
  userId: string;
  eventId: string;
  onUpdate: () => void;
}> = ({ value, paymentId, userId, eventId, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleMethodChange = async (method: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/events/${eventId}/payments`, {
        method: paymentId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          user_id: userId,
          payment_method: method,
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        onUpdate();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-wine hover:text-wine-dark"
      >
        {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Set method'}
      </button>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => handleMethodChange(e.target.value)}
      disabled={isSaving}
      className="text-sm border border-wine-light rounded px-2 py-1"
      onBlur={() => !isSaving && setIsEditing(false)}
      autoFocus
    >
      <option value="">Select...</option>
      <option value="venmo">Venmo</option>
      <option value="paypal">PayPal</option>
      <option value="zelle">Zelle</option>
      <option value="cash">Cash</option>
      <option value="other">Other</option>
    </select>
  );
};

export const EventLedgerDialog: React.FC<EventLedgerDialogProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}) => {
  const [ledgerData, setLedgerData] = useState<EventLedgerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchLedgerData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}/ledger`);
      if (response.ok) {
        const data = await response.json();
        setLedgerData(data);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLedgerData();
    }
  }, [isOpen, eventId]);

  const columnHelper = createColumnHelper<EventLedgerAttendee>();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => <div className="font-medium text-gray-900">{info.getValue()}</div>,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => <div className="text-sm text-gray-600">{info.getValue()}</div>,
    }),
    columnHelper.accessor('rsvp_status', {
      header: 'RSVP',
      cell: (info) => (
        <div className="text-sm capitalize">
          {info.getValue() === 'registered' ? 'Attending' : info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('payment_status', {
      header: 'Payment',
      cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('payment_amount', {
      header: 'Amount',
      cell: (info) => {
        const value = info.getValue();
        return value ? `$${value.toFixed(2)}` : '-';
      },
    }),
    columnHelper.accessor('payment_method', {
      header: 'Method',
      cell: (info) => (
        <PaymentMethodCell
          value={info.getValue()}
          paymentId={info.row.original.payment_id}
          userId={info.row.original.user_id}
          eventId={eventId}
          onUpdate={fetchLedgerData}
        />
      ),
    }),
    columnHelper.accessor('payment_date', {
      header: 'Date',
      cell: (info) => {
        const value = info.getValue();
        return value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
      },
    }),
  ];

  const table = useReactTable({
    data: ledgerData?.attendees || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExportCSV = () => {
    if (!ledgerData) return;

    const headers = ['Name', 'Email', 'RSVP', 'Payment Status', 'Amount', 'Method', 'Date'];
    const rows = ledgerData.attendees.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.rsvp_status,
      attendee.payment_status || 'pending',
      attendee.payment_amount ? `$${attendee.payment_amount.toFixed(2)}` : '-',
      attendee.payment_method || '-',
      attendee.payment_date ? new Date(attendee.payment_date).toLocaleDateString() : '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/\s+/g, '-')}-ledger.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPercentagePaid = () => {
    if (!ledgerData || ledgerData.total_attendees === 0) return 0;
    return Math.round((ledgerData.paid_count / ledgerData.total_attendees) * 100);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Event Ledger: ${eventTitle}`} maxWidth="xl">
      {isLoading ? (
        <div className="text-center py-8 text-wine">Loading ledger...</div>
      ) : ledgerData ? (
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-wine-light/30 border border-wine-light rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-wine-dark">
                <span className="font-semibold">{ledgerData.paid_count}/{ledgerData.total_attendees}</span> paid
              </div>
              <div className="text-sm text-wine-dark">
                <span className="font-semibold">${ledgerData.total_collected.toFixed(2)}</span>
                {ledgerData.total_expected > 0 && (
                  <span className="text-gray-600"> / ${ledgerData.total_expected.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-wine h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${getPercentagePaid()}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1 text-right">{getPercentagePaid()}% paid</div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-wine-light rounded-lg">
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-wine text-white rounded-lg hover:bg-wine-dark transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">No ledger data available</div>
      )}
    </Dialog>
  );
};
