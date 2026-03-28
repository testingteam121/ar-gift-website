import { useState, useEffect, useCallback } from 'react';
import { productApi } from '@/lib/api';
import { Product, ProductCategory } from '@/types';

interface UseProductsOptions {
  category?: ProductCategory;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    category,
    search,
    page = 1,
    limit = 12,
    sort = '-createdAt',
    minPrice,
    maxPrice,
    autoFetch = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit, sort };
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;

      const { data } = await productApi.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, page, limit, sort, minPrice, maxPrice]);

  useEffect(() => {
    if (autoFetch) fetchProducts();
  }, [fetchProducts, autoFetch]);

  return { products, loading, error, total, totalPages, currentPage, refetch: fetchProducts };
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    productApi
      .getOne(id)
      .then(({ data }) => setProduct(data.product))
      .catch((err) => setError(err.response?.data?.message || 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
