// hooks/useProducts.ts
import { useState, useEffect } from 'react';


import productsService from '../services/products-home';
import Product, { CreateProductRequest, ProductWithId, UpdateProductRequest } from '../types/products';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (productData: CreateProductRequest) => Promise<ProductWithId>;
  updateProduct: (id: string, productData: UpdateProductRequest) => Promise<ProductWithId>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos
  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productsService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crear producto
  const createProduct = async (productData: CreateProductRequest): Promise<ProductWithId> => {
    try {
      const newProduct = await productsService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  // Actualizar producto
  const updateProduct = async (id: string, productData: UpdateProductRequest): Promise<ProductWithId> => {
    try {
      const updated = await productsService.updateProduct(id, productData);
      setProducts(prev => prev.map(p => (p as ProductWithId).id === id ? updated : p));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  // Eliminar producto
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await productsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => (p as ProductWithId).id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};

export default useProducts;