import 'package:equatable/equatable.dart';
import '../../../../models/cart/cart_item.dart';

abstract class CartState extends Equatable {
  const CartState();

  @override
  List<Object?> get props => [];
}

class CartInitial extends CartState {}

class CartLoaded extends CartState {
  final List<CartItem> items;

  const CartLoaded(this.items);

  int get totalItems => items.fold(0, (sum, item) => sum + item.quantity);
  double get totalPrice => items.fold(0, (sum, item) => sum + item.totalPrice);

  CartLoaded copyWith({
    List<CartItem>? items,
  }) {
    return CartLoaded(items ?? this.items);
  }

  @override
  List<Object?> get props => [items];
}
