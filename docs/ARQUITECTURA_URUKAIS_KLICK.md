# Arquitectura Técnica Completa — Urukais Klick

> Documento que extiende los 4 pilares fundamentales con flujo de datos, estructura de proyectos y matriz de tecnologías.

---

## Paso 5 – Flujo de datos y diagrama de arquitectura

### 5.1 Viaje de una petición (User Tap → Respuesta en pantalla)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLIENTE (Flutter / React Native / Swift / Kotlin)                          │
│  ─────────────────────────────────────────────────                          │
│  1. Usuario pulsa un botón (ej: "Ver catálogo")                             │
│  2. UI Layer dispara un Evento / Intent / Action                            │
│  3. State Manager (BLoC / Redux / ViewModel) procesa la intención           │
│  4. Repository Pattern consulta caché local (Hive / SQLite / MMKV)          │
│     ├─ Cache HIT → Muestra datos inmediatamente (experiencia offline)       │
│     └─ Cache MISS → Continúa al paso 5                                      │
│  5. Service Layer construye la petición HTTP/REST o GraphQL                │
│  6. Interceptor añade headers (Auth JWT, Device-ID, Accept-Language)         │
│  7. Envía petición HTTPS (TLS 1.3) al API Gateway / CDN Edge               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CAPA PERIMETRAL (Edge / CDN / WAF)                                         │
│  ──────────────────────────────────                                         │
│  8. Cloudflare / AWS CloudFront / FastAI intercepta la petición             │
│  9. WAF (Web Application Firewall) filtra SQLi, XSS, DDoS básico            │
│  10. Rate Limiting por IP / usuario (bucket algorithm)                      │
│  11. Si es asset estático (imagen, video) → Sirve desde caché edge y RETORNA│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  API GATEWAY (Kong / AWS API Gateway / NGINX Ingress)                       │
│  ────────────────────────────────────────────────                           │
│  12. Enrutamiento a microservicio correcto (/users → servicio-usuarios)     │
│  13. Validación de JWT (firma, expiración, claims)                          │
│  14. Verificación de scopes / roles (RBAC / ABAC)                           │
│  15. Transformación de protocolos si aplica (REST ↔ gRPC interno)           │
│  16. Circuit breaker check (si el servicio destino está caído → fallback)  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  MICROSERVICIOS (Backend / Lógica de Negocio)                               │
│  ────────────────────────────────────────────                               │
│  Servicio de Contenido (Node.js / Go / Python / Java)                       │
│  ─────────────────────────────────────────────────                          │
│  17. Controller recibe DTO / Request Model                                   │
│  18. Middleware de validación (Joi / Zod / class-validator / Pydantic)      │
│  19. Service Layer aplica reglas de negocio (descuentos, geolocalización)   │
│  20. Orchestrator / Saga (si requiere múltiples servicios)                 │
│      ├─ Llama a Servicio de Inventario (verifica stock)                     │
│      ├─ Llama a Servicio de Precios (calcula promociones)                   │
│      └─ Compensa si alguno falla (patrón Saga o Outbox)                    │
│  21. Repository / DAO consulta Base de Datos                                │
│  22. Cache aside: consulta Redis primero, si no existe → DB → guarda en Redis│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CAPA DE DATOS                                                              │
│  ─────────────                                                              │
│  23. PostgreSQL ejecuta query optimizado (índices, partitions si aplica)     │
│  24. Replica de lectura distribuye carga (read replicas)                    │
│  25. Datos sensibles desencriptados en memoria (AES-256)                    │
│  26. Retorna ResultSet / Documento / Row al Repository                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CAMINO DE VUELTA (Response Pipeline)                                         │
│  ──────────────────────────────────                                         │
│  27. Repository mapea entidad de DB → Domain Model / DTO                   │
│  28. Service Layer enriquece respuesta (metadatos, paginación)              │
│  29. Controller serializa a JSON / Protobuf                                   │
│  30. API Gateway añade headers de seguridad (CORS, HSTS, CSP)               │
│  31. CDN comprime respuesta (Brotli / Gzip) si es texto                     │
│  32. Cliente recibe Response (200 OK + body)                                 │
│  33. Cliente: Interceptor deserializa, guarda en caché local, emite estado │
│  34. UI Layer recibe nuevo estado y re-renderiza widgets                    │
│  35. Animación de transición completa la experiencia                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Diagrama de componentes de alto nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │   Mobile    │  │    Web      │  │   Desktop   │  │  Admin Panel    │    │
│  │  (Flutter)  │  │  (Next.js)  │  │  (Electron) │  │  (React/Vue)    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘    │
│         └─────────────────┴─────────────────┘                 │             │
│                              │                                │             │
│                    ┌─────────┴─────────┐                      │             │
│                    │   State Manager   │                      │             │
│                    │ (BLoC / Redux /    │                      │             │
│                    │  Riverpod / Pinia) │                      │             │
│                    └─────────┬─────────┘                      │             │
│                              │                                │             │
│                    ┌─────────┴─────────┐                      │             │
│                    │  HTTP Client +    │                      │             │
│                    │  Local Cache      │                      │             │
│                    └─────────┬─────────┘                      │             │
└──────────────────────────────┼────────────────────────────────┼─────────────┘
                               │                                │
                               ▼                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EDGE / GATEWAY LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │     CDN     │  │  WAF / DDoS │  │ Rate Limiter│  │  Load Balancer  │    │
│  │  (Static)   │  │  Protection │  │  (Redis)    │  │  (ALB / NGINX)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / MESH                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │   Auth      │  │  Routing    │  │   Logging   │  │  Transform      │    │
│  │  (JWT/OAuth)│  │  (Path→Svc) │  │  & Metrics  │  │  (REST↔gRPC)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Auth Svc    │    │ Content Svc   │    │ Payment Svc   │
│  (Users/JWT)  │    │ (Catalog/Feed)│   │ (Stripe/Adyen)│
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ PostgreSQL    │    │ PostgreSQL    │    │ PostgreSQL    │
│ + Redis       │    │ + Elasticsearch│   │ + Encrypted   │
│               │    │ + S3 (Assets) │    │   Vault       │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## Paso 6 – Estructura de carpetas en un proyecto real

### 6.1 Frontend Mobile (Flutter – recomendado para Urukais Klick)

```
urukais_klick_mobile/
├── android/                          # Configuración nativa Android
├── ios/                              # Configuración nativa iOS
├── lib/
│   ├── main.dart                     # Entry point
│   ├── app.dart                      # MaterialApp / CupertinoApp config
│   ├── config/
│   │   ├── routes.dart               # GoRouter / Navigator 2.0
│   │   ├── theme.dart                # Colores, tipografía, dark mode
│   │   └── constants.dart            # URLs, timeouts, feature flags
│   ├── core/
│   │   ├── errors/                   # Excepciones personalizadas
│   │   ├── usecases/                 # Contratos de casos de uso
│   │   ├── utils/                    # Helpers, formatters, validators
│   │   └── network/                  # Dio config, interceptors
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── models/           # DTOs (JSON ↔ Dart)
│   │   │   │   ├── datasources/      # Remote & Local sources
│   │   │   │   └── repositories/     # Implementaciones
│   │   │   ├── domain/
│   │   │   │   ├── entities/         # Objetos de dominio puros
│   │   │   │   ├── repositories/     # Contratos abstractos
│   │   │   │   └── usecases/         # Login, Register, Logout...
│   │   │   └── presentation/
│   │   │       ├── bloc/             # BLoC / Cubit (events, states)
│   │   │       ├── pages/            # Screens
│   │   │       └── widgets/          # Componentes reutilizables
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── notifications/
│   │   └── profile/
│   └── shared/
│       ├── widgets/                  # Botones, inputs, cards globales
│       ├── animations/               # Transiciones reutilizables
│       └── local_storage/            # Hive / SharedPreferences wrappers
├── test/
│   ├── unit/                         # Tests de lógica pura
│   ├── widget/                       # Tests de UI (golden tests)
│   └── integration/                  # Flujos completos
├── pubspec.yaml
└── analysis_options.yaml
```

### 6.2 Backend API (Node.js + TypeScript – Express / Fastify / NestJS)

```
urukais_klick_api/
├── src/
│   ├── main.ts                         # Bootstrap app
│   ├── app.module.ts                   # NestJS root module (si aplica)
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── env.validation.ts           # Joi / Zod schema para env vars
│   ├── common/
│   │   ├── decorators/                 # @CurrentUser, @Roles, @Public
│   │   ├── filters/                    # Global exception filters
│   │   ├── guards/                     # AuthGuard, RolesGuard
│   │   ├── interceptors/               # LoggingInterceptor, TransformInterceptor
│   │   ├── pipes/                      # ValidationPipe, ParseUUIDPipe
│   │   └── utils/                      # Paginación, formatters
│   ├── modules/
│   │   ├── users/
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts      # TypeORM / Prisma / Mongoose
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.spec.ts
│   │   ├── catalog/
│   │   ├── orders/
│   │   ├── payments/
│   │   └── notifications/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── message-queue/
│   │   │   └── rabbitmq.publisher.ts
│   │   ├── storage/
│   │   │   └── s3.service.ts
│   │   └── cache/
│   │       └── redis.service.ts
│   └── types/
│       └── global.d.ts
├── tests/
│   ├── e2e/                            # Tests end-to-end (Supertest)
│   └── integration/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── scripts/
│   └── deploy-staging.sh
├── .env.example
├── .env.staging
├── .env.production
├── jest.config.js
├── tsconfig.json
└── package.json
```

### 6.3 Infraestructura como Código (Terraform + Kubernetes)

```
urukais_klick_infra/
├── terraform/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── eks/                        # Kubernetes cluster
│   │   ├── rds/
│   │   ├── elasticache/              # Redis
│   │   ├── s3/
│   │   └── alb/                        # Load balancer
│   ├── environments/
│   │   ├── dev/
│   │   │   └── main.tf
│   │   ├── staging/
│   │   │   └── main.tf
│   │   └── production/
│   │       └── main.tf
│   └── global/
│       ├── iam.tf
│       └── route53.tf
├── kubernetes/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── hpa.yaml                    # Horizontal Pod Autoscaler
│   │   └── ingress.yaml
│   └── overlays/
│       ├── staging/
│       │   └── kustomization.yaml
│       └── production/
│           └── kustomization.yaml
├── helm/
│   └── urukais-klick/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
└── scripts/
    ├── init-backend.sh
    └── apply-production.sh
```

---

## Paso 7 – Matriz de elección de tecnologías según tipo de app

### 7.1 Urukais Klick como Marketplace / E-commerce

| Capa | Tecnología Recomendada | Justificación |
|------|------------------------|---------------|
| **Mobile** | Flutter | Single codebase iOS+Android, rendimiento nativo, Skia renderer, gran ecosistema de packages |
| **Web** | Next.js 14 (App Router) | SSR/SSG para SEO, React Server Components, edge functions en Vercel |
| **Admin** | React + Vite + TanStack Query | SPA rápida, tipado con TS, gestión de servidor-state robusta |
| **Backend API** | NestJS (Node + TS) | Arquitectura modular tipo Angular, inyección de dependencias, excelente para microservicios |
| **API Style** | REST + WebSocket | REST para CRUD, WS para notificaciones en tiempo real (pedidos, mensajes) |
| **Base de datos principal** | PostgreSQL 16 | ACID, JSONB para flexibilidad, excelente para transacciones de e-commerce |
| **Búsqueda avanzada** | Elasticsearch | Full-text search, filtros faceted, autocompletado de productos |
| **Caché** | Redis Cluster | Sesiones, rate limiting, cache de queries hot, pub/sub para WS |
| **Cola de mensajes** | RabbitMQ / Apache Kafka | Kafka para eventos de analytics, RabbitMQ para jobs asíncronos (emails, PDFs) |
| **Almacenamiento** | AWS S3 + CloudFront | Infinito escalable, CDN global para imágenes de productos |
| **Auth** | OAuth2 + JWT + Refresh Tokens | Keycloak o Auth0 para SSO, JWT stateless para APIs |
| **Pagos** | Stripe / Adyen | PCI compliant, soporte SCA (3D Secure), webhooks robustos |
| **Notificaciones** | Firebase Cloud Messaging + OneSignal | Push nativo iOS/Android, topics segmentados |
| **Observabilidad** | Prometheus + Grafana + Loki + Tempo | Métricas, logs y trazas unificados (stack LGTM) |
| **CI/CD** | GitHub Actions → ArgoCD | Build en GitHub, despliegue GitOps en Kubernetes |
| **Cloud** | AWS (EKS, RDS, ElastiCache, S3) | Ecosistema maduro, soporte enterprise, regiones multi-continente |

### 7.2 Alternativas si el perfil cambia

| Escenario | Cambios clave en stack |
|-----------|------------------------|
| **App de streaming de video** | Flutter sigue válido; Backend → Go o Rust ( alto throughput); DB → PostgreSQL + CDN video (AWS MediaConvert / Mux); Storage → S3 + HLS/DASH streaming |
| **App social / chat masivo** | Mobile → React Native (si se prioriza velocidad de equipo web); Backend → Elixir (Phoenix) o Go; DB → PostgreSQL + ScyllaDB/Cassandra; Real-time → Phoenix Channels o Socket.io clusterizado |
| **Fintech / Neobank** | Mobile → Nativo (Swift/Kotlin) por exigencias regulatorias; Backend → Java Spring Boot o Kotlin; DB → PostgreSQL + CockroachDB; Seguridad → HSM, mTLS, vault(HashiCorp); Compliance → PCI DSS, SOC2 |
| **SaaS B2B interno** | Web → Next.js; Mobile innecesario; Backend → NestJS o Django; DB → PostgreSQL; Auth → Microsoft Entra ID / Okta SSO; Deploy → Docker Compose en VPS o Railway/Render |
| **Juegos / Gamificación** | Motor → Unity o Unreal (C# / C++); Backend → C++ (UE dedicated) o Go; DB → Redis + ScyllaDB; Multiplayer → Photon Engine o custom UDP |
| **Low-latency / Trading** | Backend → Rust o C++; DB → TimescaleDB o kdb+; Messaging → Aeron / Solace; Deploy → bare metal con kernel tuning |

---

## Paso 8 – Arquitecturas específicas por flujo crítico

### 8.1 Checkout y Pagos (flujo transaccional crítico)

```
Usuario confirma carrito
        │
        ▼
┌─────────────────┐
│  API Gateway    │
│  Idempotencia   │  ← Key = userId + cartVersion (evita doble cobro)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Order Service  │
│  Estado: PENDING│
└────────┬────────┘
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Stock Service  │────→│  Reserva stock  │  ← Saga: reserva compensable
│  (reserva)      │     │  (soft reserve) │
└────────┬────────┘     └─────────────────┘
         ▼
┌─────────────────┐
│ Payment Service │
│  Stripe Intent  │  ← 3D Secure si aplica
└────────┬────────┘
         ▼
    ┌────────┐
    │ ¿Éxito?│
    └───┬────┘
   Sí   │   No
   ▼    │    ▼
┌───────┐│ ┌──────────┐
│Capture││ │ Liberar  │
│Funds  ││ │ stock    │
│Order  ││ │ Notificar│
│PAID   ││ │ usuario  │
└───────┘│ └──────────┘
         ▼
┌─────────────────┐
│  Outbox Pattern │  ← Evento "OrderPaid" escrito en tabla outbox
│  (PostgreSQL)   │    Worker pollea y publica a Kafka/RabbitMQ
└─────────────────┘
         ▼
┌─────────────────┐
│  Notification   │
│  Service        │  ← Email + Push: "Tu pedido #123 está confirmado"
└─────────────────┘
```

### 8.2 Feed de contenido personalizado (alto rendimiento de lectura)

```
Usuario abre app → Feed personalizado
        │
        ▼
┌─────────────────────────┐
│  Cliente consulta /feed │
│  con cursor pagination  │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  API Gateway            │
│  Cache-Control: max-age │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│  Redis (Feed pre-armado)│  ← Fan-out on write: cada vez que un creador
│  key: feed:userId       │    publica, se escribe en feeds de followers
└───────────┬─────────────┘
   Cache HIT │ Cache MISS
      ▼          ▼
  Retorna   ┌─────────────────┐
  inmediato │  Feed Service   │
            │  Construye feed │
            │  (ML ranking)   │
            └────────┬────────┘
                     ▼
            ┌─────────────────┐
            │  Elasticsearch  │
            │  (filtros, geo) │
            └────────┬────────┘
                     ▼
            ┌─────────────────┐
            │  PostgreSQL     │
            │  (datos finos)  │
            └─────────────────┘
```

---

## Paso 9 – Seguridad por capas (Security Deep Dive)

| Capa | Medida | Implementación |
|------|--------|----------------|
| **Cliente** | Certificate pinning | SSL public key hardcodeada en binario mobile |
| **Cliente** | Root detection / Jailbreak | Bloqueo o degradado de funcionalidad en dispositivos rooteados |
| **Cliente** | Secure Storage | iOS Keychain / Android Keystore para tokens y secrets |
| **Transporte** | TLS 1.3 + HSTS | Certificados wildcard, OCSP stapling, cert pinning |
| **Edge** | WAF + Bot Management | Cloudflare / AWS WAF con reglas OWASP Core Rule Set |
| **Gateway** | Rate limiting + Throttling | Token bucket por usuario/IP; 429 Too Many Requests |
| **Gateway** | Input validation | JSON Schema validation; sanitización de queries |
| **Servicio** | Authentication | JWT access (corto: 15 min) + refresh token (largo: 7 días) en httpOnly cookie |
| **Servicio** | Authorization | RBAC (roles) + ABAC (atributos: suscripción, geografía) |
| **Servicio** | Output encoding | Escapado de HTML/JS en respuestas; prevención de información leakage |
| **Datos** | Encryption at rest | AES-256 para discos EBS/RDS; S3 SSE-KMS |
| **Datos** | Encryption in transit | TLS para DB connections; VPN entre VPCs |
| **Datos** | Masking / Tokenization | PAN de tarjetas tokenizados (Stripe); PII anonimizada en logs |
| **Datos** | Backup encryption | Snapshots RDS encriptados, política de retención 7 años si aplica |
| **DevOps** | Secrets management | HashiCorp Vault o AWS Secrets Manager; NUNCA hardcodeados |
| **DevOps** | Container security | Imágenes escaneadas con Trivy / Snyk; non-root user en containers |
| **DevOps** | Dependency scanning | Dependabot / Snyk en pipeline CI; SBOM generado por build |

---

## Paso 10 – Métricas de éxito y SLA objetivo

| Indicador | Objetivo | Herramienta de medición |
|-----------|----------|------------------------|
| Disponibilidad (Uptime) | 99.99% (~4.32 min downtime/mes) | Grafana + UptimeRobot |
| Latencia p95 (API) | < 200 ms | Prometheus histograms |
| Latencia p99 (API) | < 500 ms | Prometheus histograms |
| Tiempo de carga Web | < 2.5 s (LCP) | Lighthouse / Web Vitals |
| Tiempo de interacción Mobile | < 100 ms (gesto a feedback) | Firebase Performance |
| Error rate | < 0.1% | Sentry / Grafana alerts |
| Throughput checkout | > 1000 TPS | Load testing con k6 |
| RTO (Recovery Time Objective) | < 15 minutos | Runbooks + PagerDuty |
| RPO (Recovery Point Objective) | < 5 minutos de datos | Backups continuos RDS |

---

## Resumen de arquitectura visual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Urukais Klick — Stack Final                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  PRESENTACIÓN          Flutter (iOS/Android) + Next.js (Web)              │
│  LOGICA                NestJS + TypeScript / REST + WebSocket              │
│  DATOS                 PostgreSQL 16 + Redis + Elasticsearch + S3           │
│  MENSAJERIA            RabbitMQ (jobs) + Kafka (eventos)                     │
│  PAGOS                 Stripe / Adyen                                        │
│  NOTIFICACIONES        Firebase Cloud Messaging                              │
│  EDGE                  Cloudflare (CDN + WAF + DDoS)                       │
│  ORQUESTACIÓN          Kubernetes (EKS) + Helm + ArgoCD                      │
│  INFRAESTRUCTURA       AWS (EKS, RDS, ElastiCache, S3, ALB)                 │
│  OBSERVABILIDAD        Prometheus + Grafana + Loki + Tempo + PagerDuty     │
│  SEGURIDAD             OAuth2 + JWT + Vault + TLS 1.3 + WAF + Pentests    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*Documento generado como referencia técnica para el equipo de desarrollo de Urukais Klick. Puede evolucionar con decisiones de tecnología futuras.*
