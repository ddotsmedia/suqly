const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiCall(
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available (only in browser)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getListings(page = 1, limit = 20) {
  return apiCall(`/listings?page=${page}&limit=${limit}`);
}

export async function getListing(id: number) {
  return apiCall(`/listings/${id}`);
}

export async function getCategories() {
  return apiCall('/categories');
}

export async function login(phone: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOTP(phone: string, otp: string) {
  return apiCall('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
}

export async function createSavedSearch(name: string, query: Record<string, any>, filters: Record<string, any>, emailAlert: boolean, frequency: string) {
  return apiCall('/listings/saved-searches', {
    method: 'POST',
    body: JSON.stringify({ name, query, filters, emailAlert, frequency }),
  });
}

export async function getSavedSearches(limit = 10, offset = 0) {
  return apiCall(`/listings/saved-searches?limit=${limit}&offset=${offset}`);
}

export async function getSavedSearch(id: number) {
  return apiCall(`/listings/saved-searches/${id}`);
}

export async function updateSavedSearch(id: number, name: string, query: Record<string, any>, filters: Record<string, any>, emailAlert: boolean, frequency: string) {
  return apiCall(`/listings/saved-searches/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, query, filters, emailAlert, frequency }),
  });
}

export async function deleteSavedSearch(id: number) {
  return apiCall(`/listings/saved-searches/${id}`, {
    method: 'DELETE',
  });
}

export async function getSavedSearchResults(id: number) {
  return apiCall(`/listings/saved-searches/${id}/results`);
}

export async function addToWishlist(listingId: number): Promise<void> {
  return apiCall(`/listings/${listingId}/wishlist`, {
    method: 'POST',
  });
}

export async function removeFromWishlist(listingId: number): Promise<void> {
  return apiCall(`/listings/${listingId}/wishlist`, {
    method: 'DELETE',
  });
}

export async function getWishlist(limit = 20, offset = 0) {
  return apiCall(`/wishlist?limit=${limit}&offset=${offset}`);
}

export async function getPublicWishlist(shareToken: string) {
  return apiCall(`/wishlist/share/${shareToken}`);
}

export async function createWishlistShareLink() {
  return apiCall('/wishlist/share/create', {
    method: 'POST',
  });
}

export async function deleteWishlistShareLink() {
  return apiCall('/wishlist/share', {
    method: 'DELETE',
  });
}

export async function checkIsInWishlist(listingId: number) {
  return apiCall(`/wishlist/check/${listingId}`);
}

export async function exportWishlistCSV() {
  const response = await fetch(`${API_URL}/wishlist/export`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.blob();
}
