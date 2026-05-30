import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/checkout_repository.dart';
import 'checkout_event.dart';
import 'checkout_state.dart';

class CheckoutBloc extends Bloc<CheckoutEvent, CheckoutState> {
  final CheckoutRepository _checkoutRepository;

  CheckoutBloc({CheckoutRepository? checkoutRepository})
      : _checkoutRepository = checkoutRepository ?? CheckoutRepository(),
        super(CheckoutInitial()) {
    on<CheckoutStarted>(_onStarted);
  }

  Future<void> _onStarted(CheckoutStarted event, Emitter<CheckoutState> emit) async {
    emit(CheckoutLoading());
    try {
      final items = event.cart.items.map((item) => CheckoutItemDto(
            productId: item.product.id,
            productName: item.product.name,
            unitPrice: item.product.price,
            quantity: item.quantity,
          )).toList();

      final result = await _checkoutRepository.createOrder(
        customerEmail: event.customerEmail,
        customerName: event.customerName,
        customerPhone: event.customerPhone,
        shippingAddress: event.shippingAddress,
        items: items,
      );

      emit(CheckoutSuccess(result.orderId));
    } catch (e) {
      emit(CheckoutError(e.toString()));
    }
  }
}
