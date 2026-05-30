import 'package:equatable/equatable.dart';
import '../../../../../models/product.dart';

abstract class ProductListState extends Equatable {
  const ProductListState();

  @override
  List<Object?> get props => [];
}

class ProductListInitial extends ProductListState {}

class ProductListLoading extends ProductListState {
  final bool isFirstFetch;

  const ProductListLoading({this.isFirstFetch = true});

  @override
  List<Object?> get props => [isFirstFetch];
}

class ProductListLoaded extends ProductListState {
  final List<Product> products;
  final int total;
  final int page;
  final int limit;
  final bool hasReachedMax;

  const ProductListLoaded({
    required this.products,
    required this.total,
    required this.page,
    required this.limit,
    this.hasReachedMax = false,
  });

  ProductListLoaded copyWith({
    List<Product>? products,
    int? total,
    int? page,
    int? limit,
    bool? hasReachedMax,
  }) {
    return ProductListLoaded(
      products: products ?? this.products,
      total: total ?? this.total,
      page: page ?? this.page,
      limit: limit ?? this.limit,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
    );
  }

  @override
  List<Object?> get props => [products, total, page, limit, hasReachedMax];
}

class ProductListError extends ProductListState {
  final String message;

  const ProductListError(this.message);

  @override
  List<Object?> get props => [message];
}
