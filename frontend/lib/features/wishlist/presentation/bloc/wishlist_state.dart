import 'package:equatable/equatable.dart';
import '../../../../models/product.dart';

abstract class WishlistState extends Equatable {
  const WishlistState();
  @override
  List<Object?> get props => [];
}

class WishlistInitial extends WishlistState {}

class WishlistLoading extends WishlistState {}

class WishlistLoadedState extends WishlistState {
  final List<Product> products;
  final Set<String> favoriteIds;
  const WishlistLoadedState(this.products, this.favoriteIds);
  @override
  List<Object?> get props => [products, favoriteIds];
}

class WishlistError extends WishlistState {
  final String message;
  const WishlistError(this.message);
  @override
  List<Object?> get props => [message];
}
