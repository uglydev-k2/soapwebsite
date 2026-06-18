export type ChatProductResult = {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceLabel: string;
  fragrance: string | null;
  image: string | null;
  inStock: boolean;
  url: string;
};

export type ChatPageContext = {
  pathname: string;
  productSlug?: string;
};
