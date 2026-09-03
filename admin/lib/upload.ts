import { api } from './api';
import axios from 'axios';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadedImage {
  id: string;
  url: string;
  order: number;
}

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Formato no válido. Usa JPG, PNG, WebP o GIF.';
  }
  if (file.size > MAX_SIZE) {
    return 'El archivo supera el límite de 5MB.';
  }
  return null;
}

export async function uploadImageToS3(
  file: File,
  productId: string,
): Promise<UploadedImage> {
  // 1. Get presigned URL from backend
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const { data } = await api.post('/admin/uploads/presign', {
    contentType: file.type,
    fileExtension: ext,
  });

  // 2. Upload directly to S3 using the presigned URL (no auth headers)
  await axios.put(data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  });

  // 3. Associate image with product
  const imageRes = await api.post(`/admin/products/${productId}/images`, {
    url: data.publicUrl,
    order: 0,
  });

  return imageRes.data;
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<void> {
  await api.delete(`/admin/products/${productId}/images/${imageId}`);
}
