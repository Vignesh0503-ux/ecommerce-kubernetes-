# E-Commerce Microservices Platform — Phase 1: Java Microservices + Frontend

This phase delivers the four Spring Boot microservices described in the spec, each with:

- Java 17, Spring Boot 3.2.5, Spring Web, Spring Data JPA, PostgreSQL driver, Spring Boot Actuator
- CRUD REST APIs matching the spec exactly
- Config read from environment variables (no hardcoded DB host/port/credentials/service URLs)
- CORS enabled (origin list from `CORS_ALLOWED_ORIGINS`) so a browser-based frontend can call them directly
- A `Dockerfile` (multi-stage build) per service, ready for Phase 3/4
- A root `docker-compose.yml` so you can already run and test the whole thing end-to-end now,
  including Order Service → User Service / Product Service communication over Docker network
  service names (not `localhost`), which satisfies the spec's requirement for that pattern.

It also includes a **React frontend** (not part of the original Kubernetes-practice spec, added
on request) — a clean shop UI plus an admin dashboard, talking directly to each service's port.

```text
ecommerce-microservices/
├── user-service/            → /api/users        (user_db)
├── product-service/         → /api/products      (product_db)
├── order-service/           → /api/orders        (order_db, calls user-service + product-service)
├── notification-service/    → /api/notifications  (notification_db)
├── frontend/                → React + Vite + Tailwind app (shop + admin)
├── postgres-init/           → creates the 4 databases in the single local Postgres container
├── docker-compose.yml
└── k8s/                     → empty for now, filled in during the Kubernetes phases
```

## Running it

```bash
docker compose up --build
```

This starts one PostgreSQL 16 container (with `user_db`, `product_db`, `order_db`,
`notification_db` created automatically), all four backend services, and the frontend:

| Service              | Port (host) |
|-----------------------|-------------|
| frontend (UI)          | 3000        |
| user-service          | 8081        |
| product-service       | 8082        |
| order-service         | 8083        |
| notification-service  | 8084        |

Open **http://localhost:3000** for the app.

## Frontend

- **Shop** (`/`) — browse products, search, add to cart
- **Cart** (`/cart`) — adjust quantities, checkout (creates a real order per line item + a notification)
- **My Orders** (`/orders`) — order history for the currently selected customer, with live status
- **Admin** (`/admin`) — CRUD screens for Users, Products, Orders (change status), Notifications

There's no real authentication (per the spec's "keep it simple" rule) — use the **"Shopping
as…"** dropdown in the top bar to pick or create a customer, which is who orders get placed as.

### Run the frontend outside Docker (hot reload)

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173. It reads backend URLs from `frontend/.env` (already set to
`localhost:8081-8084` to match the ports above — copy `.env.example` if you ever need to change
them). The four backend services already allow `http://localhost:5173` via CORS, so this works
whether the backend is running via `docker compose up` or standalone.

## Testing each backend service directly

### User Service

```bash
curl -X POST localhost:8081/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","phone":"555-0100"}'

curl localhost:8081/api/users
curl localhost:8081/api/users/1
curl -X DELETE localhost:8081/api/users/1
```

### Product Service

```bash
curl -X POST localhost:8082/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","description":"Mechanical keyboard","price":49.99,"quantity":100}'

curl localhost:8082/api/products
curl localhost:8082/api/products/1
curl -X PUT localhost:8082/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","description":"Mechanical keyboard","price":44.99,"quantity":95}'
curl -X DELETE localhost:8082/api/products/1
```

### Order Service (validates user + product, checks stock, computes total price)

```bash
# Create a user and a product first (ids 1 and 1, following the examples above), then:
curl -X POST localhost:8083/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":1,"quantity":2}'

curl localhost:8083/api/orders
curl localhost:8083/api/orders/1
curl -X PUT localhost:8083/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMED"}'
```

Try it with a non-existent `userId` or `productId`, or a `quantity` greater than stock —
you should get a `400 Bad Request` with a clear message instead of a raw stack trace.

### Notification Service

```bash
curl -X POST localhost:8084/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"message":"Your order was created","type":"ORDER_CREATED"}'

curl localhost:8084/api/notifications
```

### Health checks (used later for liveness/readiness probes)

```bash
curl localhost:8081/actuator/health
curl localhost:8082/actuator/health
curl localhost:8083/actuator/health
curl localhost:8084/actuator/health
```

## Running a single service outside Docker

Each service also has local defaults in `application.properties` (`localhost`, default
Postgres credentials), so you can run one directly against a local Postgres if you prefer:

```bash
cd user-service
mvn clean package
mvn spring-boot:run
```

## What's intentionally not here yet

Per the spec: no Kafka/RabbitMQ, no real auth, no payments, no service mesh. The `k8s/` folder
is a placeholder — it gets filled in starting with Phase 5 (namespace, ConfigMap, Secret,
Deployments, Services), after Phase 2 (already covered — PostgreSQL) and Phase 3/4 (Docker +
Docker Compose, also already covered above). The frontend will get its own Deployment/Service
(and an Ingress route) alongside the backend once we reach that phase.

## Next phase

**Phase 5 — Kubernetes basic deployment**: namespace, ConfigMap/Secret, Deployments and
Services for all four microservices (plus the frontend) and PostgreSQL with a
PersistentVolumeClaim. Let me know when you're ready and I'll build that phase next.

