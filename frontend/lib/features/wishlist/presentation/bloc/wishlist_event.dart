import 'package:equatable/equatable.dart';

abstract class WishlistEvent extends Equatable {
  const WishlistEvent();
  @override
  List<Object?> get props => [];
}

class WishlistLoaded extends WishlistEvent {
  const WishlistLoaded();
}

class WishlistItemToggled extends WishlistEvent {
  final String productId;
  const WishlistItemToggled(this.productId);
  @override
  List<Object?> get props => [productId];
}
