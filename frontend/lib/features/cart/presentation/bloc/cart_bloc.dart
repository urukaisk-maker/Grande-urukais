import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../models/cart/cart_item.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends Bloc<CartEvent, CartState> {
  CartBloc() : super(const CartLoaded([])) {
    on<CartItemAdded>(_onItemAdded);
    on<CartItemRemoved>(_onItemRemoved);
    on<CartItemQuantityChanged>(_onQuantityChanged);
    on<CartCleared>(_onCleared);
  }

  void _onItemAdded(CartItemAdded event, Emitter<CartState> emit) {
    if (state is! CartLoaded) return;
    final current = state as CartLoaded;
    final index = current.items.indexWhere(
      (i) => i.product.id == event.product.id && i.variantId == event.variantId,
    );

    if (index >= 0) {
      final updated = [...current.items];
      updated[index] = updated[index].copyWith(
        quantity: updated[index].quantity + event.quantity,
      );
      emit(CartLoaded(updated));
    } else {
      emit(CartLoaded([
        ...current.items,
        CartItem(product: event.product, quantity: event.quantity, variantId: event.variantId),
      ]));
    }
  }

  void _onItemRemoved(CartItemRemoved event, Emitter<CartState> emit) {
    if (state is! CartLoaded) return;
    final current = state as CartLoaded;
    emit(CartLoaded(
      current.items.where((i) => !(i.product.id == event.productId && i.variantId == event.variantId)).toList(),
    ));
  }

  void _onQuantityChanged(CartItemQuantityChanged event, Emitter<CartState> emit) {
    if (state is! CartLoaded) return;
    final current = state as CartLoaded;
    if (event.quantity <= 0) {
      emit(CartLoaded(
        current.items.where((i) => !(i.product.id == event.productId && i.variantId == event.variantId)).toList(),
      ));
      return;
    }
    final updated = current.items.map((item) {
      if (item.product.id == event.productId && item.variantId == event.variantId) {
        return item.copyWith(quantity: event.quantity);
      }
      return item;
    }).toList();
    emit(CartLoaded(updated));
  }

  void _onCleared(CartCleared event, Emitter<CartState> emit) {
    emit(const CartLoaded([]));
  }
}
