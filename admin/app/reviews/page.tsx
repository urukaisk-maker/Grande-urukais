'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { PaginatedResponse, Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import AdminLayout from '@/components/layout/admin-layout';
import { toast } from 'sonner';
import { Trash2, Star } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = () => {
    api.get<PaginatedResponse<Review>>('/admin/reviews?page=1&limit=50')
      .then((res) => setReviews(res.data.data))
      .catch(() => toast.error('Error al cargar reseñas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReviews(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Reseña eliminada');
      loadReviews();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
        <p className="text-gray-500 mt-1">{reviews.length} reseñas en total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Star className="w-12 h-12 mb-3" />
            <p>No hay reseñas</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valoración</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comentario</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {review.product?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {review.user ? `${review.user.firstName} ${review.user.lastName}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {review.comment || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(review.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
