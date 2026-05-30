import 'package:equatable/equatable.dart';

abstract class ProductDetailEvent extends Equatable {
  const ProductDetailEvent();

  @override
  List<Object?> get props => [];
}

class ProductDetailFetched extends ProductDetailEvent {
  final String productId;

  const ProductDetailFetched(this.productId);

  @override
  List<Object?> get props => [productId];
}
