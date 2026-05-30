import 'package:equatable/equatable.dart';
import '../../../cart/presentation/bloc/cart_state.dart';

abstract class CheckoutEvent extends Equatable {
  const CheckoutEvent();

  @override
  List<Object?> get props => [];
}

class CheckoutStarted extends CheckoutEvent {
  final String customerEmail;
  final String customerName;
  final String? customerPhone;
  final String? shippingAddress;
  final CartLoaded cart;

  const CheckoutStarted({
    required this.customerEmail,
    required this.customerName,
    this.customerPhone,
    this.shippingAddress,
    required this.cart,
  });

  @override
  List<Object?> get props => [customerEmail, customerName, customerPhone, shippingAddress, cart];
}
