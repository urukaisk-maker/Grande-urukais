import 'package:equatable/equatable.dart';
import '../../../../models/product.dart';

abstract class CartEvent extends Equatable {
  const CartEvent();

  @override
  List<Object?> get props => [];
}

class CartItemAdded extends CartEvent {
  final Product product;
  final int quantity;
  final String? variantId;

  const CartItemAdded(this.product, {this.quantity = 1, this.variantId});

  @override
  List<Object?> get props => [product, quantity, variantId];
}

class CartItemRemoved extends CartEvent {
  final String productId;
  final String? variantId;

  const CartItemRemoved(this.productId, {this.variantId});

  @override
  List<Object?> get props => [productId, variantId];
}

class CartItemQuantityChanged extends CartEvent {
  final String productId;
  final int quantity;
  final String? variantId;

  const CartItemQuantityChanged(this.productId, this.quantity, {this.variantId});

  @override
  List<Object?> get props => [productId, quantity, variantId];
}

class CartCleared extends CartEvent {
  const CartCleared();
}
