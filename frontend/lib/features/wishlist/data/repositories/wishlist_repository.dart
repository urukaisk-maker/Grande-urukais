import 'package:dio/dio.dart';
import '../../../../config/constants.dart';
import '../../../../core/network/dio_client.dart';

abstract class WishlistRepository {
  Future<List<dynamic>> getWishlist();
  Future<void> addToWishlist(String productId);
  Future<void> removeFromWishlist(String productId);
  Future<bool> isFavorite(String productId);
}

class WishlistRepositoryImpl implements WishlistRepository {
  final Dio _dio = DioClient().instance;

  @override
  Future<List<dynamic>> getWishlist() async {
    final response = await _dio.get('${ApiConstants.fullBaseUrl}/wishlist');
    return response.data as List<dynamic>;
  }

  @override
  Future<void> addToWishlist(String productId) async {
    await _dio.post('${ApiConstants.fullBaseUrl}/wishlist/$productId');
  }

  @override
  Future<void> removeFromWishlist(String productId) async {
    await _dio.delete('${ApiConstants.fullBaseUrl}/wishlist/$productId');
  }

  @override
  Future<bool> isFavorite(String productId) async {
    final response = await _dio.get('${ApiConstants.fullBaseUrl}/wishlist/check/$productId');
    return response.data as bool;
  }
}
