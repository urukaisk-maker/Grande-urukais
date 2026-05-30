import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/catalog_repository.dart';
import 'product_list_event.dart';
import 'product_list_state.dart';

class ProductListBloc extends Bloc<ProductListEvent, ProductListState> {
  final CatalogRepository _catalogRepository;
  String? _currentCategoryId;
  String? _currentSearch;

  String? get currentCategoryId => _currentCategoryId;
  String? get currentSearch => _currentSearch;

  ProductListBloc({required CatalogRepository catalogRepository})
      : _catalogRepository = catalogRepository,
        super(ProductListInitial()) {
    on<ProductListFetched>(_onFetched);
    on<ProductListLoadMore>(_onLoadMore);
    on<ProductListSearchChanged>(_onSearchChanged);
    on<ProductListCategorySelected>(_onCategorySelected);
  }

  Future<void> _onFetched(ProductListFetched event, Emitter<ProductListState> emit) async {
    _currentCategoryId = event.categoryId;
    _currentSearch = event.search;

    emit(const ProductListLoading(isFirstFetch: true));
    try {
      final result = await _catalogRepository.getProducts(
        page: 1,
        limit: 20,
        categoryId: event.categoryId,
        search: event.search,
        minPrice: event.minPrice,
        maxPrice: event.maxPrice,
        sortBy: event.sortBy,
        sortOrder: event.sortOrder,
      );
      emit(ProductListLoaded(
        products: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasReachedMax: result.data.length >= result.total,
      ));
    } catch (e) {
      emit(ProductListError(e.toString()));
    }
  }

  Future<void> _onLoadMore(ProductListLoadMore event, Emitter<ProductListState> emit) async {
    if (state is! ProductListLoaded) return;
    final current = state as ProductListLoaded;
    if (current.hasReachedMax) return;

    emit(const ProductListLoading(isFirstFetch: false));
    try {
      final result = await _catalogRepository.getProducts(
        page: current.page + 1,
        limit: current.limit,
        categoryId: _currentCategoryId,
        search: _currentSearch,
      );
      emit(current.copyWith(
        products: [...current.products, ...result.data],
        page: result.page,
        hasReachedMax: current.products.length + result.data.length >= result.total,
      ));
    } catch (e) {
      emit(ProductListError(e.toString()));
    }
  }

  Future<void> _onSearchChanged(ProductListSearchChanged event, Emitter<ProductListState> emit) async {
    _currentSearch = event.search;
    add(ProductListFetched(search: event.search, categoryId: _currentCategoryId));
  }

  Future<void> _onCategorySelected(ProductListCategorySelected event, Emitter<ProductListState> emit) async {
    _currentCategoryId = event.categoryId;
    add(ProductListFetched(categoryId: event.categoryId, search: _currentSearch));
  }
}
