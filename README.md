# Urukais Klick

> Aplicación completa — Frontend, Backend e Infraestructura.

## Sobre el proyecto

Urukais Klick es una aplicación profesional construida con arquitectura moderna, escalable y orientada a microservicios. Nace de la pasión por convertir ideas en realidad digital.

**Nuestra visión es tu visión.** Somos buenos en imaginar visiones que tú estás imaginando y haremos que esa visión se convierta en realidad. Y lo hacemos bien.

---

## Autor

| | |
|---|---|
| **Nombre** | Manuel Casimiro Carrasco |
| **Rol** | Desarrollador Web |
| **Ubicación** | Plaza Prin, Reus, Tarragona, España |
| **Teléfono** | 622 311 428 |
| **Email** | urukaisk@gmail.com |
| **Idiomas** | Español (nativo), Inglés (avanzado) |
| **GitHub** | [@urukaisk-maker](https://github.com/urukaisk-maker) |

Manuel es un desarrollador web con amplia experiencia en tecnología. Durante su formación se destacó por su dedicación y habilidad para resolver problemas de manera creativa, participando en proyectos y obteniendo certificaciones que complementaron su educación. Disfruta de la lectura, la música y los deportes, y mantiene una constante actualización sobre las últimas tendencias tecnológicas.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Mobile** | Flutter |
| **Web** | Next.js 14 |
| **Backend API** | NestJS + TypeScript |
| **Base de datos** | PostgreSQL 16 |
| **Caché / Sesiones** | Redis |
| **Búsqueda** | Elasticsearch |
| **Mensajería** | RabbitMQ / Kafka |
| **Almacenamiento** | AWS S3 + CloudFront |
| **Auth** | OAuth2 + JWT |
| **Pagos** | Stripe / Adyen |
| **Notificaciones** | Firebase Cloud Messaging |
| **Infraestructura** | AWS (EKS, RDS, ElastiCache, S3) |
| **Observabilidad** | Prometheus + Grafana + Loki + Tempo |
| **CI/CD** | GitHub Actions + ArgoCD |

---

## Estructura del monorepo

```
urukais-klick/
├── backend/                  # API NestJS (auth, catálogo, pagos)
├── frontend/                 # App Flutter (iOS + Android)
├── admin/                    # Panel administración Next.js 14
├── infra/                    # Terraform + Kubernetes
├── docs/                     # Wireframes, design system, arquitectura
├── docker-compose.yml        # Servicios locales (DB, Cache, MQ)
└── README.md                 # Este archivo
```

---

## Cómo empezar

### Requisitos

- Docker + Docker Compose
- Node.js 20+
- Flutter 3.x
- Git

### Levantar servicios locales

```bash
docker-compose up -d
```

Eso inicia PostgreSQL, Redis y RabbitMQ localmente.

### Backend

```bash
cd backend
npm install
# Copia .env.example a .env y ajusta los valores
cp .env.example .env
# Crea la base de datos y aplica migraciones
npx prisma migrate dev --name init
# Inserta datos iniciales (categorías, productos, usuario demo)
npx prisma db seed
# Inicia el servidor en modo desarrollo
npm run start:dev
```

La API estará disponible en `http://localhost:3000/api/v1`.

Documentación Swagger en `http://localhost:3000/api/v1/docs`.

**Usuario demo:** `demo@urukaisklick.com` / `password123`

### Frontend Mobile (Flutter)

```bash
cd frontend
flutter pub get
flutter run
```

---

## Arquitectura

Consulta `docs/ARQUITECTURA_URUKAIS_KLICK.md` para el documento técnico completo.

---

© 2025 Urukais Klick — Manuel Casimiro Carrasco
