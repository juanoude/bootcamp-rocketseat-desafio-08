import { Product } from '../hooks/cart';

const hasProduct = (products: Product[], product: Product): boolean => {
  const idExists = products.filter(
    productState => productState.id === product.id,
  );

  if (idExists.length === 0) {
    return false;
  }
  return true;
};

export default hasProduct;
