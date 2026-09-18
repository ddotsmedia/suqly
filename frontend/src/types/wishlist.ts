export interface WishlistItem {
  id: number;
  listingId: number;
  title: string;
  price: number;
  category: string;
  emirate: string;
  city: string;
  image: string;
  addedAt: string;
  seller: {
    id: number;
    displayName: string;
  };
}

export interface WishlistShare {
  shareToken: string;
  shareUrl: string;
}

export interface PublicWishlist {
  user: {
    id: number;
    displayName: string;
  };
  items: WishlistItem[];
}
