import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/auth/presentation/bloc/auth_state.dart';
import 'features/auth/presentation/pages/login_screen.dart';
import 'features/catalog/data/repositories/catalog_repository.dart';
import 'features/catalog/presentation/bloc/category/category_bloc.dart';
import 'features/catalog/presentation/bloc/product_list/product_list_bloc.dart';
import 'features/catalog/presentation/pages/product_list_screen.dart';
import 'features/cart/presentation/bloc/cart_bloc.dart';
import 'features/wishlist/data/repositories/wishlist_repository.dart';
import 'features/wishlist/presentation/bloc/wishlist_bloc.dart';

class UrukaisKlickApp extends StatelessWidget {
  const UrukaisKlickApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(create: (_) => AuthRepositoryImpl()),
        RepositoryProvider(create: (_) => CatalogRepositoryImpl()),
        RepositoryProvider(create: (_) => WishlistRepositoryImpl()),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthBloc(
              authRepository: context.read<AuthRepositoryImpl>(),
            )..add(const AuthCheckSessionRequested()),
          ),
          BlocProvider(
            create: (context) => CategoryBloc(
              catalogRepository: context.read<CatalogRepositoryImpl>(),
            ),
          ),
          BlocProvider(
            create: (context) => ProductListBloc(
              catalogRepository: context.read<CatalogRepositoryImpl>(),
            ),
          ),
          BlocProvider(
            create: (_) => CartBloc(),
          ),
          BlocProvider(
            create: (context) => WishlistBloc(
              repository: context.read<WishlistRepositoryImpl>(),
            )..add(const WishlistLoaded()),
          ),
        ],
        child: MaterialApp(
          title: 'Urukais Klick',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
            useMaterial3: true,
          ),
          home: const AuthGate(),
        ),
      ),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthFailure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message), backgroundColor: Colors.red),
          );
        }
      },
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthLoading) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (state is AuthAuthenticated) {
            return const ProductListScreen();
          }
          return const LoginScreen();
        },
      ),
    );
  }
}
