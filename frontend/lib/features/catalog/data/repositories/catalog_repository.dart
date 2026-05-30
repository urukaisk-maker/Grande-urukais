import '../../../../core/network/dio_client.dart';
import '../../../../config/constants.dart';
import '../../../../models/category.dart' as models;
import '../../../../models/product.dart' as models;

abstract class CatalogRepository {
  Future<List<models.Category>> getCategories();
  Future<models.Product> getProduct(String id);
  Future<({List<models.Product> data, int total, int page, int limit})> getProducts({
    int page,
    int limit,
    String? categoryId,
    String? search,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? sortOrder,
  });
}

class CatalogRepositoryImpl implements CatalogRepository {
  final DioClient _dioClient;

  CatalogRepositoryImpl() : _dioClient = DioClient();

  @override
  Future<List<models.Category>> getCategories() async {
    final response = await _dioClient.instance.get(ApiConstants.categories);
    final List<dynamic> data = response.data;
    return data.map((e) => models.Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  @override
  Future<models.Product> getProduct(String id) async {
    final response = await _dioClient.instance.get('${ApiConstants.products}/$id');
    return models.Product.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<({List<models.Product> data, int total, int page, int limit})> getProducts({
    int page = 1,
    int limit = 20,
    String? categoryId,
    String? search,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? sortOrder,
  }) async {
    final query = <String, dynamic>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (categoryId != null) query['categoryId'] = categoryId;
    if (search != null && search.isNotEmpty) query['search'] = search;
    if (minPrice != null) query['minPrice'] = minPrice.toString();
    if (maxPrice != null) query['maxPrice'] = maxPrice.toString();
    if (sortBy != null) query['sortBy'] = sortBy;
    if (sortOrder != null) query['sortOrder'] = sortOrder;

    final response = await _dioClient.instance.get(
      ApiConstants.products,
      queryParameters: query,
    );

    final Map<String, dynamic> data = response.data as Map<String, dynamic>;
    final List<dynamic> items = data['data'] as List<dynamic>;

    return (
      data: items.map((e) => models.Product.fromJson(e as Map<String, dynamic>)).toList(),
      total: data['total'] as int,
      page: data['page'] as int,
      limit: data['limit'] as int,
    );
  }
}
