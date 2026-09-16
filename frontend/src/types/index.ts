export interface User {
  id: number;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  createdAt: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  status: 'draft' | 'active' | 'sold' | 'archived';
  sellerId: number;
  images: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  listingId?: number;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: number;
  buyerId: number;
  sellerId: number;
  rating: number;
  comment: string;
  listingId: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  statusCode?: number;
}
