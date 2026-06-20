# Gemini Vision — Recoded Stack

Aplikasi identifikasi barang bekas dengan AI Vision.

## Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + React 19 |
| Backend API | Fastify + Node.js + TypeScript |
| AI | OpenAI GPT-4o (siap migrasi ke AWS Bedrock) |
| Database | MySQL 8 via mysql2 |
| Storage | AWS S3 (opsional, bisa dinonaktifkan lokal) |
| Container | Docker + docker-compose |
| IAC | Terraform (AWS: VPC, ECS, RDS, S3, ECR) |

---

## Cara Mulai (Development Lokal)

### 1. Clone & copy env

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` — isi `OPENAI_API_KEY` dan info MySQL.

### 2. Jalankan semua service

```bash
docker compose up --build
```

Ini akan menjalankan:
- MySQL di port `3306`
- Fastify backend di port `4000`
- Next.js frontend di port `3000`

### 3. Jalankan migrasi DB (sekali saja)

```bash
cd backend
npm install
npm run db:migrate
```

### 4. Buka browser

```
http://localhost:3000
```

---

## Struktur Project

```
gemini-vision/
├── frontend/               # Next.js 15 app
│   ├── src/
│   │   ├── app/            # App Router pages & layouts
│   │   ├── components/     # React components
│   │   ├── lib/            # API client, session, utils
│   │   └── types/          # Shared TypeScript types
│   └── Dockerfile
│
├── backend/                # Fastify Node.js API
│   ├── src/
│   │   ├── db/             # MySQL connection, migration, repository
│   │   ├── routes/         # identify.route.ts, history.route.ts
│   │   ├── services/       # openai.service.ts, s3.service.ts
│   │   └── server.ts       # Fastify entrypoint
│   └── Dockerfile
│
├── terraform/              # AWS infrastructure
│   ├── main.tf             # VPC, ECS, RDS MySQL, ECR, S3
│   └── variables.tf
│
└── docker-compose.yml      # Local dev orchestration
```

---

## Migrasi ke AWS Bedrock

Ketika siap ganti dari OpenAI ke AWS Bedrock, edit `backend/src/services/openai.service.ts`:

```ts
// Ganti import:
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Model target: "anthropic.claude-3-5-sonnet-20241022-v2:0"
// atau untuk multimodal: "anthropic.claude-3-haiku-20240307-v1:0"
```

Tidak ada perubahan di frontend, database, atau infrastruktur.

---

## Endpoint API

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/v1/identify` | Identifikasi barang dari gambar (base64) |
| GET | `/api/v1/history?sessionId=&page=&pageSize=` | Ambil riwayat identifikasi |
| DELETE | `/api/v1/history/:id` | Hapus satu record |
| GET | `/health` | Health check backend |

---

## Deploy ke AWS

```bash
cd terraform
terraform init
terraform plan -var="db_password=YOURPASSWORD"
terraform apply -var="db_password=YOURPASSWORD"
```

Setelah Terraform selesai, push Docker images ke ECR yang sudah dibuat:

```bash
# Contoh push backend ke ECR
$(aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <ECR_URL>)
docker build -t gemini-vision-backend ./backend
docker tag gemini-vision-backend:latest <ECR_BACKEND_URL>:latest
docker push <ECR_BACKEND_URL>:latest
```

---

## Python Service (Nanti)

Ketika siap menambahkan Python service (FastAPI untuk AI processing):
1. Buat folder `python-service/` dengan FastAPI app
2. Tambahkan service baru di `docker-compose.yml`
3. Panggil dari Fastify backend via HTTP internal
4. Tambahkan ECS task definition baru di Terraform
