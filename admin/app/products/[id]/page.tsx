'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Product, Category, ProductImage } from '@/lib/types';
import AdminLayout from '@/components/layout/admin-layout';
import ImageUploader from '@/components/products/image-uploader';
import { toast } from 'sonner';
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    isActive: true,
    categoryId: '',
  });

  useEffect(() => {
    const id = params.id as string;
    Promise.all([
      api.get(`/admin/products/${id}`),
      api.get('/admin/categories'),
    ]).then(([prodRes, catRes]) => {
      const p = prodRes.data;
      setProduct(p);
      setImages(p.images || []);
      setForm({
        name: p.name,
        description: p.description,
        price: String(p.price),
        stock: String(p.stock),
        isActive: p.isActive,
        categoryId: p.categoryId,
      });
      setCategories(catRes.data);
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/products/${params.id}`, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        isActive: form.isActive,
        categoryId: form.categoryId,
      });
      toast.success('Producto actualizado');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
      setSaving(false);
    }
  };

  if (!product) {
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
        <button onClick={() => router.push('/products')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-4">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
            <input
              type="text" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea
              value={form.description} required rows={3}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio (€)</label>
              <input
                type="number" step="0.01" value={form.price} required
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
              <input
                type="number" value={form.stock} required
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
            <select
              value={form.categoryId} required
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Producto activo</span>
          </label>

          <button
            type="submit" disabled={saving}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Image Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <ImageIcon className="w-5 h-5 text-primary-600" />
          Imágenes del producto
        </h2>
        <ImageUploader
          productId={params.id as string}
          images={images}
          onImagesChange={setImages}
        />
      </div>
    </AdminLayout>
  );
}
