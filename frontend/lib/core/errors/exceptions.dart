class ServerException implements Exception {
  final String message;
  final int? statusCode;

  const ServerException({this.message = 'Server error', this.statusCode});

  @override
  String toString() => 'ServerException: $message (status: $statusCode)';
}

class NetworkException implements Exception {
  final String message;

  const NetworkException({this.message = 'Network error'});

  @override
  String toString() => 'NetworkException: $message';
}

class AuthException implements Exception {
  final String message;

  const AuthException({this.message = 'Authentication error'});

  @override
  String toString() => 'AuthException: $message';
}
