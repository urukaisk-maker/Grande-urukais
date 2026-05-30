import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/wishlist_repository.dart';
import 'wishlist_event.dart';
import 'wishlist_state.dart';
import '../../../../models/product.dart';

class WishlistBloc extends Bloc<WishlistEvent, WishlistState> {
  final WishlistRepository _repository;

  WishlistBloc({required WishlistRepository repository})
      : _repository = repository,
        super(WishlistInitial()) {
    on<WishlistLoaded>(_onLoaded);
    on<WishlistItemToggled>(_onToggled);
  }

  Future<void> _onLoaded(WishlistLoaded event, Emitter<WishlistState> emit) async {
    emit(WishlistLoading());
    try {
      final data = await _repository.getWishlist();
      final products = data.map((e) => Product.fromJson(e['product'] as Map<String, dynamic>)).toList();
      final ids = products.map((p) => p.id).toSet();
      emit(WishlistLoadedState(products, ids));
    } catch (e) {
      emit(WishlistError(e.toString()));
    }
  }

  Future<void> _onToggled(WishlistItemToggled event, Emitter<WishlistState> emit) async {
    final current = state;
    if (current is WishlistLoadedState) {
      final isFav = current.favoriteIds.contains(event.productId);
      try {
        if (isFav) {
          await _repository.removeFromWishlist(event.productId);
          final updatedIds = Set<String>.from(current.favoriteIds)..remove(event.productId);
          final updatedProducts = current.products.where((p) => p.id != event.productId).toList();
          emit(WishlistLoadedState(updatedProducts, updatedIds));
        } else {
          await _repository.addToWishlist(event.productId);
          final updatedIds = Set<String>.from(current.favoriteIds)..add(event.productId);
          emit(WishlistLoadedState(current.products, updatedIds));
        }
      } catch (e) {
        emit(WishlistError(e.toString()));
      }
    }
  }
}
