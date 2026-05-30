import '../product.dart';

class CartItem {
  final Product product;
  int quantity;
  final String? variantId;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.variantId,
  });

  double get totalPrice {
    final variant = product.variants.firstWhere(
      (v) => v.id == variantId,
      orElse: () => ProductVariant(
        id: '', sku: '', stock: 0, priceAdjustment: 0, isActive: true,
      ),
    );
    return (product.price + variant.priceAdjustment) * quantity;
  }

  String get displayName {
    final variant = product.variants.firstWhere(
      (v) => v.id == variantId,
      orElse: () => ProductVariant(
        id: '', sku: '', stock: 0, priceAdjustment: 0, isActive: true,
      ),
    );
    if (variant.size != null || variant.color != null) {
      final parts = <String>[];
      if (variant.size != null) parts.add('Talla: ${variant.size}');
      if (variant.color != null) parts.add('Color: ${variant.color}');
      return '${product.name} (${parts.join(', ')})';
    }
    return product.name;
  }

  CartItem copyWith({
    Product? product,
    int? quantity,
    String? variantId,
  }) {
    return CartItem(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      variantId: variantId ?? this.variantId,
    );
  }
}
