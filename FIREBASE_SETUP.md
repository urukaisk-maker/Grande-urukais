# Firebase Cloud Messaging Setup

## 1. Crear proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (o usa uno existente)
3. Añade una app Android con el package name de tu app Flutter
4. Descarga `google-services.json` y colócalo en `frontend/android/app/`
5. Añade una app iOS si es necesario y descarga `GoogleService-Info.plist` en `frontend/ios/Runner/`

## 2. Configurar Android

En `frontend/android/build.gradle`:
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

En `frontend/android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## 3. Dependencias Flutter

Añade a `frontend/pubspec.yaml`:
```yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0
```

Luego ejecuta:
```bash
cd frontend
flutter pub get
```

## 4. Inicializar en main.dart

```dart
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const UrukaisKlickApp());
}
```

## 5. Activar notificaciones en PushNotificationService

Descomenta el código en `frontend/lib/core/notifications/push_notification_service.dart` y completa la inicialización.

## 6. Backend - Enviar notificaciones

Puedes usar la API REST de FCM v1 o Firebase Admin SDK. Ejemplo con curl:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "Nuevo pedido",
      "body": "Tu pedido ha sido confirmado"
    }
  }'
```

## Nota

El campo `fcmToken` ya está añadido al modelo `User` y existe el endpoint `POST /auth/fcm-token` para registrar el token desde Flutter.
