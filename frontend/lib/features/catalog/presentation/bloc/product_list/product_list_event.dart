import 'package:equatable/equatable.dart';

abstract class ProductListEvent extends Equatable {
  const ProductListEvent();

  @override
  List<Object?> get props => [];
}

class ProductListFetched extends ProductListEvent {
  final String? categoryId;
  final String? search;
  final double? minPrice;
  final double? maxPrice;
  final String? sortBy;
  final String? sortOrder;

  const ProductListFetched({
    this.categoryId,
    this.search,
    this.minPrice,
    this.maxPrice,
    this.sortBy,
    this.sortOrder,
  });

  @override
  List<Object?> get props => [categoryId, search, minPrice, maxPrice, sortBy, sortOrder];
}

class ProductListLoadMore extends ProductListEvent {
  const ProductListLoadMore();
}

class ProductListSearchChanged extends ProductListEvent {
  final String search;

  const ProductListSearchChanged(this.search);

  @override
  List<Object?> get props => [search];
}

class ProductListCategorySelected extends ProductListEvent {
  final String? categoryId;

  const ProductListCategorySelected(this.categoryId);

  @override
  List<Object?> get props => [categoryId];
}
