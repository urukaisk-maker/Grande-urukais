import 'package:flutter/material.dart';
import '../../data/repositories/auth_repository.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  final AuthRepository _repo = AuthRepositoryImpl();
  List<Map<String, dynamic>> _addresses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await _repo.getAddresses();
      setState(() {
        _addresses = list.cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Direcciones'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context),
        child: const Icon(Icons.add),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _addresses.isEmpty
              ? const Center(child: Text('No tienes direcciones guardadas'))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _addresses.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (_, index) {
                    final addr = _addresses[index];
                    return ListTile(
                      leading: Icon(
                        addr['isDefault'] == true ? Icons.star : Icons.location_on,
                        color: addr['isDefault'] == true ? Colors.amber : Colors.grey,
                      ),
                      title: Text(addr['label'] ?? 'Sin nombre'),
                      subtitle: Text(
                        '${addr['street']}, ${addr['city']} ${addr['postalCode']}',
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () async {
                          await _repo.deleteAddress(addr['id'] as String);
                          _load();
                        },
                      ),
                    );
                  },
                ),
    );
  }

  void _showAddDialog(BuildContext context) {
    final labelCtrl = TextEditingController();
    final streetCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final postalCtrl = TextEditingController();
    bool isDefault = false;

    showDialog(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Nueva dirección'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: labelCtrl, decoration: const InputDecoration(labelText: 'Nombre (ej. Casa)')),
                TextField(controller: streetCtrl, decoration: const InputDecoration(labelText: 'Calle y número')),
                TextField(controller: cityCtrl, decoration: const InputDecoration(labelText: 'Ciudad')),
                TextField(controller: postalCtrl, decoration: const InputDecoration(labelText: 'Código postal')),
                Row(
                  children: [
                    Checkbox(
                      value: isDefault,
                      onChanged: (v) => setDialogState(() => isDefault = v ?? false),
                    ),
                    const Text('Dirección por defecto'),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            ElevatedButton(
              onPressed: () async {
                await _repo.createAddress({
                  'label': labelCtrl.text,
                  'street': streetCtrl.text,
                  'city': cityCtrl.text,
                  'postalCode': postalCtrl.text,
                  'isDefault': isDefault,
                });
                Navigator.pop(ctx);
                _load();
              },
              child: const Text('Guardar'),
            ),
          ],
        ),
      ),
    );
  }
}
