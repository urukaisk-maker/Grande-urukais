import '../../../../core/network/dio_client.dart';
import '../../../../config/constants.dart';

class CheckoutItemDto {
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;

  CheckoutItemDto({
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'productName': productName,
        'unitPrice': unitPrice,
        'quantity': quantity,
      };
}

class CheckoutResult {
  final String orderId;
  final String clientSecret;

  CheckoutResult({required this.orderId, required this.clientSecret});

  factory CheckoutResult.fromJson(Map<String, dynamic> json) {
    return CheckoutResult(
      orderId: json['order']['id'] as String,
      clientSecret: json['clientSecret'] as String,
    );
  }
}

class CheckoutRepository {
  final DioClient _dioClient;

  CheckoutRepository() : _dioClient = DioClient();

  Future<CheckoutResult> createOrder({
    required String customerEmail,
    required String customerName,
    String? customerPhone,
    String? shippingAddress,
    required List<CheckoutItemDto> items,
  }) async {
    final response = await _dioClient.instance.post(
      '${ApiConstants.fullBaseUrl}/orders/checkout',
      data: {
        'customerEmail': customerEmail,
        'customerName': customerName,
        'customerPhone': customerPhone,
        'shippingAddress': shippingAddress,
        'items': items.map((i) => i.toJson()).toList(),
      },
    );
    return CheckoutResult.fromJson(response.data as Map<String, dynamic>);
  }
}
