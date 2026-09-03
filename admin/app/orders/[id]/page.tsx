'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import AdminLayout from '@/components/layout/admin-layout';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

const statuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/admin/orders/${params.id}`)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error('Pedido no encontrado'));
  }, [params]);

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/orders/${params.id}/status`, { status });
      setOrder(res.data);
      toast.success('Estado actualizado');
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <button onClick={() => router.push('/orders')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-4">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id.slice(-8)}</h1>
            <p className="text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
              {order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Artículos</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(item.unitPrice)} x {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-primary-600">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Nombre</p>
              <p className="font-medium text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-medium text-gray-900">{order.customerEmail}</p>
            </div>
            {order.customerPhone && (
              <div>
                <p className="text-gray-400">Teléfono</p>
                <p className="font-medium text-gray-900">{order.customerPhone}</p>
              </div>
            )}
            {order.shippingAddress && (
              <div>
                <p className="text-gray-400">Dirección</p>
                <p className="font-medium text-gray-900">{order.shippingAddress}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
