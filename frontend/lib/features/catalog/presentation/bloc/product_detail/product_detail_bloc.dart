import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/catalog_repository.dart';
import 'product_detail_event.dart';
import 'product_detail_state.dart';

class ProductDetailBloc extends Bloc<ProductDetailEvent, ProductDetailState> {
  final CatalogRepository _catalogRepository;

  ProductDetailBloc({required CatalogRepository catalogRepository})
      : _catalogRepository = catalogRepository,
        super(ProductDetailInitial()) {
    on<ProductDetailFetched>(_onFetched);
  }

  Future<void> _onFetched(ProductDetailFetched event, Emitter<ProductDetailState> emit) async {
    emit(ProductDetailLoading());
    try {
      final product = await _catalogRepository.getProduct(event.productId);
      emit(ProductDetailLoaded(product));
    } catch (e) {
      emit(ProductDetailError(e.toString()));
    }
  }
}
