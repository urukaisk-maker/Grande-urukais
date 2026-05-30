import 'dart:io';
import '../../features/auth/data/repositories/auth_repository.dart';

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  String? _fcmToken;

  Future<void> initialize() async {
    // firebase_messaging dependency required:
    // dependencies:
    //   firebase_messaging: ^14.7.10
    //   firebase_core: ^2.24.2
    //
    // Add to android/app/build.gradle:
    // apply plugin: 'com.google.gms.google-services'
    //
    // Place google-services.json in android/app/
    //
    // Add classpath 'com.google.gms:google-services:4.4.0' to android/build.gradle
    //
    // import 'package:firebase_core/firebase_core.dart';
    // import 'package:firebase_messaging/firebase_messaging.dart';
    //
    // await Firebase.initializeApp();
    // FirebaseMessaging messaging = FirebaseMessaging.instance;
    //
    // NotificationSettings settings = await messaging.requestPermission();
    //
    // String? token = await messaging.getToken();
    // if (token != null) {
    //   _fcmToken = token;
    //   await AuthRepositoryImpl().sendFcmToken(token);
    // }
    //
    // FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    //   // Foreground notification
    // });
    //
    // FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  String? get fcmToken => _fcmToken;
}

// Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
//   await Firebase.initializeApp();
// }
