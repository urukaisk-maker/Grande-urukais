# Deploy Guide — Urukais Klick

## 1. Backend (Render / Railway / VPS)

### Option A: Docker Compose (self-hosted or cloud VM)

```bash
# Set environment variables
export DATABASE_USER=urukais
export DATABASE_PASSWORD=your_strong_password
export DATABASE_NAME=urukais_db
export JWT_SECRET=your_jwt_secret
export STRIPE_SECRET_KEY=sk_live_...
export STRIPE_WEBHOOK_SECRET=whsec_...

# Run
docker compose -f docker-compose.prod.yml up --build -d
```

### Option B: Render (free tier)

1. Push code to GitHub
2. In Render dashboard: **New > Web Service**
3. Connect your GitHub repo
4. Set:
   - **Root directory**: `backend`
   - **Build command**: `npm install && npm run build`
   - **Start command**: `node dist/main.js`
5. Add environment variables from `.env.example`
6. Add **PostgreSQL** database in Render dashboard

### Option C: Railway

1. Push code to GitHub
2. In Railway: **New Project > Deploy from GitHub repo**
3. Add **PostgreSQL** plugin
4. Set environment variables in Railway dashboard

---

## 2. Admin Panel (Vercel)

1. Push code to GitHub
2. In Vercel dashboard: **Add New Project**
3. Import your GitHub repo
4. Set:
   - **Framework preset**: Next.js
   - **Root directory**: `admin`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
   ```
6. Deploy

The `vercel.json` is already configured in `admin/vercel.json`.

---

## 3. Flutter App (Mobile)

### Build APK for production:

```bash
cd frontend
flutter build apk --release \
  --dart-define=API_BASE_URL=https://your-backend-url.com
```

### Build for iOS:

```bash
cd frontend
flutter build ios --release \
  --dart-define=API_BASE_URL=https://your-backend-url.com
```

---

## Environment Variables Summary

| Variable | Description | Example |
|---|---|---|
| `DATABASE_HOST` | PostgreSQL host | `localhost` or Render DB host |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USER` | PostgreSQL user | `urukais` |
| `DATABASE_PASSWORD` | PostgreSQL password | `strong_password` |
| `DATABASE_NAME` | Database name | `urukais_db` |
| `JWT_SECRET` | Secret for JWT signing | `random_string_32_chars` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `CORS_ORIGIN` | Allowed CORS origin | `https://your-admin.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Admin API URL | `https://api.yoursite.com/api/v1` |

---

## Stripe Webhook Setup

For local development:
```bash
stripe listen --forward-to localhost:3000/api/v1/orders/webhook
```

For production, add webhook endpoint in Stripe Dashboard:
- **URL**: `https://your-backend.com/api/v1/orders/webhook`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
