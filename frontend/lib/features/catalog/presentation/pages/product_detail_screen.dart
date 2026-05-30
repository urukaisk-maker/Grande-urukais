import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/product_detail/product_detail_bloc.dart';
import '../bloc/product_detail/product_detail_event.dart';
import '../bloc/product_detail/product_detail_state.dart';
import '../../../../models/product.dart';
import '../../data/repositories/catalog_repository.dart';
import '../../../cart/presentation/bloc/cart_bloc.dart';
import '../../../cart/presentation/bloc/cart_event.dart';
import '../../../cart/presentation/bloc/cart_state.dart';
import '../../../cart/presentation/pages/cart_screen.dart';
import '../../../reviews/data/repositories/reviews_repository.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _quantity = 1;
  int _currentImageIndex = 0;
  ProductVariant? _selectedVariant;
  final _reviewsRepo = ReviewsRepositoryImpl();
  List<Map<String, dynamic>> _reviews = [];
  bool _reviewsLoading = true;
  int _userRating = 0;
  final _commentCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    try {
      final data = await _reviewsRepo.getReviews(widget.productId);
      setState(() {
        _reviews = data.cast<Map<String, dynamic>>();
        _reviewsLoading = false;
      });
    } catch (_) {
      setState(() => _reviewsLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProductDetailBloc(catalogRepository: CatalogRepositoryImpl())
        ..add(ProductDetailFetched(widget.productId)),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Detalle'),
          actions: [
            BlocBuilder<CartBloc, CartState>(
              builder: (context, state) {
                final count = state is CartLoaded ? state.totalItems : 0;
                return Stack(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.shopping_cart_outlined),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const CartScreen()),
                        );
                      },
                    ),
                    if (count > 0)
                      Positioned(
                        right: 4,
                        top: 4,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                          child: Text(
                            '$count',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ],
        ),
        body: BlocBuilder<ProductDetailBloc, ProductDetailState>(
          builder: (context, state) {
            if (state is ProductDetailLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is ProductDetailError) {
              return Center(child: Text('Error: ${state.message}'));
            }
            if (state is ProductDetailLoaded) {
              return _ProductContent(
                product: state.product,
                quantity: _quantity,
                currentImageIndex: _currentImageIndex,
                onQuantityChanged: (q) => setState(() => _quantity = q),
                onImageChanged: (i) => setState(() => _currentImageIndex = i),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}

class _ProductContent extends StatelessWidget {
  final Product product;
  final int quantity;
  final int currentImageIndex;
  final ValueChanged<int> onQuantityChanged;
  final ValueChanged<int> onImageChanged;

  const _ProductContent({
    required this.product,
    required this.quantity,
    required this.currentImageIndex,
    required this.onQuantityChanged,
    required this.onImageChanged,
  });

  @override
  Widget build(BuildContext context) {
    final images = product.images;
    final hasImages = images.isNotEmpty;

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image carousel
                if (hasImages)
                  AspectRatio(
                    aspectRatio: 1,
                    child: PageView.builder(
                      itemCount: images.length,
                      onPageChanged: onImageChanged,
                      itemBuilder: (context, index) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            'http://localhost:3000${images[index].url}',
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.image_not_supported)),
                          ),
                        );
                      },
                    ),
                  )
                else
                  AspectRatio(
                    aspectRatio: 1,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(child: Icon(Icons.image_not_supported, size: 64)),
                    ),
                  ),

                const SizedBox(height: 8),

                // Dots indicator
                if (hasImages && images.length > 1)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(images.length, (index) {
                      return Container(
                        width: 8,
                        height: 8,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: currentImageIndex == index
                              ? Theme.of(context).colorScheme.primary
                              : Colors.grey.shade300,
                        ),
                      );
                    }),
                  ),

                const SizedBox(height: 16),

                // Category badge
                if (product.category != null)
                  Chip(
                    label: Text(product.category!.name),
                    backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  ),

                const SizedBox(height: 8),

                // Name
                Text(
                  product.name,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),

                const SizedBox(height: 8),

                // Price
                Text(
                  '\u20AC${((product.price) + (_selectedVariant?.priceAdjustment ?? 0)).toStringAsFixed(2)}',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),

                const SizedBox(height: 16),

                // Description
                Text(
                  product.description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey.shade700,
                      ),
                ),

                const SizedBox(height: 16),

                // Stock
                Text(
                  'Stock disponible: ${_selectedVariant?.stock ?? product.stock}',
                  style: TextStyle(color: Colors.grey.shade600),
                ),

                const SizedBox(height: 16),

                // Variants selector
                if (product.variants.isNotEmpty) ...[
                  _buildVariantSelector(product),
                  const SizedBox(height: 16),
                ],

                const Divider(),
                const SizedBox(height: 16),
                _buildReviewsSection(context, product.id),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),

        // Bottom bar: quantity + add to cart
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            child: Row(
              children: [
                // Quantity selector
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove),
                        onPressed: quantity > 1 ? () => onQuantityChanged(quantity - 1) : null,
                      ),
                      Text('$quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: quantity < (_selectedVariant?.stock ?? product.stock)
                            ? () => onQuantityChanged(quantity + 1)
                            : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: product.isActive && (product.stock > 0 || _selectedVariant != null)
                        ? () {
                            if (product.variants.isNotEmpty && _selectedVariant == null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Selecciona una talla/color')),
                              );
                              return;
                            }
                            context.read<CartBloc>().add(
                              CartItemAdded(product, quantity: quantity, variantId: _selectedVariant?.id),
                            );
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Agregado $quantity x ${product.name} al carrito'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          }
                        : null,
                    icon: const Icon(Icons.shopping_cart),
                    label: const Text('Agregar al carrito'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildVariantSelector(Product product) {
    final sizes = product.variants.where((v) => v.size != null).map((v) => v.size!).toSet().toList();
    final colors = product.variants.where((v) => v.color != null).map((v) => v.color!).toSet().toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (sizes.isNotEmpty) ...[
          const Text('Talla', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: sizes.map((size) {
              final isSelected = _selectedVariant?.size == size;
              return ChoiceChip(
                label: Text(size),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      _selectedVariant = product.variants.firstWhere(
                        (v) => v.size == size && (_selectedVariant?.color == null || v.color == _selectedVariant?.color),
                        orElse: () => product.variants.firstWhere((v) => v.size == size),
                      );
                    });
                  }
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
        ],
        if (colors.isNotEmpty) ...[
          const Text('Color', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: colors.map((color) {
              final isSelected = _selectedVariant?.color == color;
              return ChoiceChip(
                label: Text(color),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      _selectedVariant = product.variants.firstWhere(
                        (v) => v.color == color && (_selectedVariant?.size == null || v.size == _selectedVariant?.size),
                        orElse: () => product.variants.firstWhere((v) => v.color == color),
                      );
                    });
                  }
                },
              );
            }).toList(),
          ),
        ],
      ],
    );
  }

  Widget _buildReviewsSection(BuildContext context, String productId) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Reseñas', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        if (_reviewsLoading)
          const Center(child: CircularProgressIndicator())
        else if (_reviews.isEmpty)
          const Text('Aún no hay reseñas. Sé el primero en opinar.')
        else
          Column(
            children: _reviews.map((r) {
              final user = r['user'] as Map<String, dynamic>?;
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(user?['firstName'] ?? 'Usuario', style: const TextStyle(fontWeight: FontWeight.w600)),
                          const Spacer(),
                          Row(
                            children: List.generate(5, (i) => Icon(
                              i < (r['rating'] as int) ? Icons.star : Icons.star_border,
                              size: 16,
                              color: Colors.amber,
                            )),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      if (r['comment'] != null) Text(r['comment'] as String),
                      Text(
                        DateTime.parse(r['createdAt'] as String).toLocal().toString().split(' ')[0],
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        const SizedBox(height: 16),
        const Text('Tu opinión', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(
          children: List.generate(5, (i) => IconButton(
            icon: Icon(
              i < _userRating ? Icons.star : Icons.star_border,
              color: Colors.amber,
            ),
            onPressed: () => setState(() => _userRating = i + 1),
          )),
        ),
        TextField(
          controller: _commentCtrl,
          decoration: const InputDecoration(
            hintText: 'Escribe tu reseña...',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
        ),
        const SizedBox(height: 8),
        ElevatedButton(
          onPressed: _userRating > 0
              ? () async {
                  try {
                    await _reviewsRepo.createReview(productId, _userRating, comment: _commentCtrl.text);
                    final data = await _reviewsRepo.getReviews(productId);
                    setState(() {
                      _reviews = data.cast<Map<String, dynamic>>();
                      _userRating = 0;
                      _commentCtrl.clear();
                    });
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                }
              : null,
          child: const Text('Enviar reseña'),
        ),
      ],
    );
  }
}
