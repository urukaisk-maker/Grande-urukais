class ProductImage {
  final String id;
  final String url;
  final int order;

  const ProductImage({
    required this.id,
    required this.url,
    required this.order,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: json['id'] as String,
      url: json['url'] as String,
      order: json['order'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'order': order,
    };
  }
}

class ProductVariant {
  final String id;
  final String sku;
  final String? size;
  final String? color;
  final int stock;
  final double priceAdjustment;
  final bool isActive;

  const ProductVariant({
    required this.id,
    required this.sku,
    this.size,
    this.color,
    required this.stock,
    required this.priceAdjustment,
    required this.isActive,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'] as String,
      sku: json['sku'] as String,
      size: json['size'] as String?,
      color: json['color'] as String?,
      stock: json['stock'] as int,
      priceAdjustment: (json['priceAdjustment'] as num).toDouble(),
      isActive: json['isActive'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sku': sku,
      'size': size,
      'color': color,
      'stock': stock,
      'priceAdjustment': priceAdjustment,
      'isActive': isActive,
    };
  }
}

class Category {
  final String id;
  final String name;
  final String slug;
  final String? imageUrl;

  const Category({
    required this.id,
    required this.name,
    required this.slug,
    this.imageUrl,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'imageUrl': imageUrl,
    };
  }
}

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final int stock;
  final bool isActive;
  final String categoryId;
  final Category? category;
  final List<ProductImage> images;
  final List<ProductVariant> variants;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    required this.isActive,
    required this.categoryId,
    this.category,
    this.images = const [],
    this.variants = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      stock: json['stock'] as int,
      isActive: json['isActive'] as bool,
      categoryId: json['categoryId'] as String,
      category: json['category'] != null
          ? Category.fromJson(json['category'] as Map<String, dynamic>)
          : null,
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => ProductImage.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      variants: (json['variants'] as List<dynamic>?)
              ?.map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'stock': stock,
      'isActive': isActive,
      'categoryId': categoryId,
      'category': category?.toJson(),
      'images': images.map((e) => e.toJson()).toList(),
      'variants': variants.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
