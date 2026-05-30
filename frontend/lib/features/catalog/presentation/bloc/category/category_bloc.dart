import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/catalog_repository.dart';
import 'category_event.dart';
import 'category_state.dart';

class CategoryBloc extends Bloc<CategoryEvent, CategoryState> {
  final CatalogRepository _catalogRepository;

  CategoryBloc({required CatalogRepository catalogRepository})
      : _catalogRepository = catalogRepository,
        super(CategoryInitial()) {
    on<CategoryFetched>(_onFetched);
  }

  Future<void> _onFetched(CategoryFetched event, Emitter<CategoryState> emit) async {
    emit(CategoryLoading());
    try {
      final categories = await _catalogRepository.getCategories();
      emit(CategoryLoaded(categories));
    } catch (e) {
      emit(CategoryError(e.toString()));
    }
  }
}
