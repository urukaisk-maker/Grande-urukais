import 'package:dio/dio.dart';
import '../../../../config/constants.dart';
import '../../../../core/network/dio_client.dart';

abstract class ReviewsRepository {
  Future<List<dynamic>> getReviews(String productId);
  Future<Map<String, dynamic>> createReview(String productId, int rating, {String? comment});
}

class ReviewsRepositoryImpl implements ReviewsRepository {
  final Dio _dio = DioClient().instance;

  @override
  Future<List<dynamic>> getReviews(String productId) async {
    final response = await _dio.get(
      '${ApiConstants.fullBaseUrl}/reviews',
      queryParameters: {'productId': productId},
    );
    return response.data as List<dynamic>;
  }

  @override
  Future<Map<String, dynamic>> createReview(String productId, int rating, {String? comment}) async {
    final response = await _dio.post(
      '${ApiConstants.fullBaseUrl}/reviews',
      data: {'productId': productId, 'rating': rating, if (comment != null) 'comment': comment},
    );
    return response.data as Map<String, dynamic>;
  }
}
