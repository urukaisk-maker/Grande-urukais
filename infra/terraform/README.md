# Infraestructura como Código — Urukais Klick

Módulos Terraform para desplegar en AWS.

## Estructura

- `modules/vpc/` — Red y subnets
- `modules/eks/` — Cluster Kubernetes
- `modules/rds/` — Base de datos PostgreSQL
- `modules/elasticache/` — Redis cluster
- `modules/s3/` — Almacenamiento de assets
- `modules/alb/` — Load balancer

## Environments

- `environments/dev/`
- `environments/staging/`
- `environments/production/`
