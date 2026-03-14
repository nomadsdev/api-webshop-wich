import { api } from "@/lib/axios";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
  image?: string;
}

export interface BuyProductRequest {
  productId: string;
  quantity: number;
}

export interface BuyProductResponse {
  success: boolean;
  data?: {
    key: string;
  };
  message?: string;
}

export interface GetProductsResponse {
  success: boolean;
  data: Product[] | { products: Product[] };
  message?: string;
}

export const productApi = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<GetProductsResponse>("/product/products");
      
      if (response.data.success) {
        const productsData = Array.isArray(response.data.data)
          ? response.data.data
          : response.data.data?.products || [];
        return productsData;
      } else {
        throw new Error(response.data.message || "ไม่สามารถดึงข้อมูลสินค้าได้");
      }
    } catch (error: any) {
      console.error("Fetch products error:", error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
      }
    }
  },

  buyProduct: async (request: BuyProductRequest): Promise<BuyProductResponse> => {
    try {
      const response = await api.post<BuyProductResponse>("/product/buy", request);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "ซื้อสินค้าไม่สำเร็จ");
      }
    } catch (error: any) {
      console.error("Buy error:", error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("เกิดข้อผิดพลาดในการซื้อสินค้า");
      }
    }
  }
};