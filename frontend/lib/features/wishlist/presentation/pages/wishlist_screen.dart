import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/wishlist_bloc.dart';
import '../bloc/wishlist_event.dart';
import '../bloc/wishlist_state.dart';
import '../../../catalog/presentation/pages/product_detail_screen.dart';

class WishlistScreen extends StatelessWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Favoritos')),
      body: BlocBuilder<WishlistBloc, WishlistState>(
        builder: (context, state) {
          if (state is WishlistLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is WishlistError) {
            return Center(child: Text('Error: ${state.message}'));
          }
          if (state is WishlistLoadedState) {
            if (state.products.isEmpty) {
              return const Center(child: Text('No tienes productos favoritos'));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: state.products.length,
              itemBuilder: (_, index) {
                final product = state.products[index];
                final imageUrl = product.images.isNotEmpty
                    ? 'http://localhost:3000${product.images.first.url}'
                    : null;
                return Card(
                  child: ListTile(
                    leading: imageUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(imageUrl, width: 56, height: 56, fit: BoxFit.cover),
                          )
                        : const Icon(Icons.image_not_supported),
                    title: Text(product.name),
                    subtitle: Text('\u20AC${product.price.toStringAsFixed(2)}'),
                    trailing: IconButton(
                      icon: const Icon(Icons.favorite, color: Colors.red),
                      onPressed: () {
                        context.read<WishlistBloc>().add(WishlistItemToggled(product.id));
                      },
                    ),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => ProductDetailScreen(productId: product.id)),
                    ),
                  ),
                );
              },
            );
          }
          return const Center(child: Text('Cargando...'));
        },
      ),
    );
  }
}
