# ✨ AR Gifts – Augmented Reality Gift Platform

> Give gifts that come alive. Attach personalized video messages to physical gifts using WebAR technology — no app required.

![AR Gifts Banner](https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)

---

## 🌟 Features

### Customer Features
- **AR Gift Customization** – 4-step wizard: choose image/template → attach AR video → preview → checkout
- **Template Gallery** – Curated templates organized by occasion (Birthday, Anniversary, Wedding, Love, Festival)
- **Preset Videos** – Ready-made AR video animations by category
- **Custom Uploads** – Upload personal images (JPG/PNG, max 10MB) and videos (MP4/MOV, max 50MB)
- **AR Preview** – Live WebAR test before purchasing using MindAR.js
- **Razorpay Payments** – UPI, Credit/Debit Card, Net Banking + Cash on Delivery
- **Order Tracking** – Real-time order status (Pending → Processing → Printing → Shipped → Delivered)
- **Email Notifications** – Beautiful HTML order confirmations and status updates
- **Responsive Design** – Mobile-first, works on all devices

### Admin Features
- **Dashboard** – Real-time stats: revenue, orders, pending items + weekly bar chart
- **Product Management** – Full CRUD with multi-image upload via Cloudinary
- **Template Management** – Upload and organize AR templates by category
- **Preset Video Management** – Upload and categorize AR animation videos
- **Order Management** – View all orders, update status, download AR assets (image + video)
- **AR Target Management** – Store and retrieve AR target references per order

### AR Technology
- **MindAR.js** – Image-tracking WebAR (no app download required)
- **A-Frame** – 3D web framework for AR overlays
- **Standalone AR Viewer** – `/public/ar-viewer.html` accepts `?target=&video=` URL params
- **Simulated AR mode** – Tap-to-reveal fallback when `.mind` file not compiled
- **True AR mode** – Full image tracking when `.mind` file is pre-compiled

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| Cloudinary | Image & video CDN storage |
| Razorpay | Payment gateway |
| Nodemailer | Transactional emails |
| Multer + multer-storage-cloudinary | File uploads |
| Bcryptjs | Password hashing |
| Helmet + CORS | Security middleware |
| Express Rate Limit | API rate limiting |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations & transitions |
| Zustand | Global state (cart, auth) |
| Axios | HTTP client |
| React Dropzone | Drag-and-drop file uploads |
| React Hot Toast | Notifications |
| Lucide React | Icons |
| MindAR.js + A-Frame | WebAR engine (CDN) |

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v18+ installed
- **MongoDB** account (MongoDB Atlas recommended)
- **Cloudinary** account (free tier works)
- **Razorpay** account (test mode is fine for development)
- **Gmail** account with App Password (for email sending)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ar-gift-website.git
cd ar-gift-website
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `/backend/.env` with your actual credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/ar-gifts
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=noreply@argifts.com

FRONTEND_URL=http://localhost:3000
NODE_ENV=development

ADMIN_EMAIL=admin@argifts.com
ADMIN_PASSWORD=Admin@123456
```

Seed the database with admin user and sample products:

```bash
npm run seed
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Edit `/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

## 💻 Running in Development

Open two terminals:

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
# App starts at http://localhost:3000
```

**Access the application:**
- 🛍️ Store: http://localhost:3000
- 🔧 Admin: http://localhost:3000/admin/login
- 🔌 API: http://localhost:5000/api
- ❤️ Health: http://localhost:5000/health

**Default Admin Credentials:**
- Email: `admin@argifts.com`
- Password: `Admin@123456`

---

## 🏗 Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

---

## ☁️ Deployment

### Frontend → Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set root directory to `frontend`
4. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
   ```
5. Deploy!

### Backend → Railway (Recommended)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set root directory to `backend`
3. Add all environment variables from `.env.example`
4. Railway auto-detects Node.js and deploys

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables

### Database → MongoDB Atlas

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create database user with read/write permissions
4. Add your server IP to Network Access (or allow all: `0.0.0.0/0`)
5. Get connection string and add to `MONGODB_URI`

---

## 🔑 Environment Variables Reference

### Backend (`/backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | Yes |
| `JWT_EXPIRE` | JWT expiry (e.g., `7d`, `24h`) | No (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes (for payments) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Yes (for payments) |
| `EMAIL_HOST` | SMTP host | Yes (for emails) |
| `EMAIL_PORT` | SMTP port (587 for TLS) | Yes |
| `EMAIL_USER` | SMTP username/email | Yes |
| `EMAIL_PASS` | SMTP password/app password | Yes |
| `EMAIL_FROM` | From address for emails | Yes |
| `FRONTEND_URL` | Frontend URL (for CORS & emails) | Yes |
| `NODE_ENV` | `development` or `production` | No |
| `ADMIN_EMAIL` | Seed admin email | No |
| `ADMIN_PASSWORD` | Seed admin password | No |

### Frontend (`/frontend/.env.local`)

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | Yes (for payments) |

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new customer | Public |
| POST | `/api/auth/login` | Customer login | Public |
| POST | `/api/auth/admin/login` | Admin login | Public |
| GET | `/api/auth/me` | Get current user | Bearer Token |

### Products
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/products` | List products (filter, paginate) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create product (multipart) | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Soft-delete product | Admin |

### Templates
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/templates?category=birthday` | List templates | Public |
| POST | `/api/templates` | Upload template | Admin |
| DELETE | `/api/templates/:id` | Delete template | Admin |

### Preset Videos
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/preset-videos?category=romantic` | List videos | Public |
| POST | `/api/preset-videos` | Upload video | Admin |
| DELETE | `/api/preset-videos/:id` | Delete video | Admin |

### Orders
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/orders` | Create order (multipart) | Public |
| GET | `/api/orders` | List orders | Bearer Token |
| GET | `/api/orders/:orderId?email=x` | Get order by ID | Public + email |
| PUT | `/api/orders/:orderId/status` | Update order status | Admin |
| GET | `/api/orders/:orderId/files` | Get signed download URLs | Admin |
| GET | `/api/orders/stats` | Dashboard stats | Admin |

### Payments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/payments/create-order` | Create Razorpay order | Public |
| POST | `/api/payments/verify` | Verify payment signature | Public |
| POST | `/api/payments/cod` | Confirm COD order | Public |

### AR Targets
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/ar/target/:orderId` | Get AR target for scanning | Public |
| POST | `/api/ar/target` | Create/update AR target | Admin |
| PUT | `/api/ar/target/:orderId/mind-file` | Update compiled .mind URL | Admin |

---

## 🎯 WebAR Setup Instructions

### How the AR System Works

1. Customer uploads/selects a **target image** (the image printed on the gift)
2. Customer selects/uploads an **AR video** (plays when gift is scanned)
3. Image and video URLs are stored in MongoDB via `ARTarget` model
4. When scanning, the AR viewer at `/ar-viewer.html` is loaded with `?target=IMAGE_URL&video=VIDEO_URL`

### For Development / Demo
The AR viewer includes a **simulated AR mode** that works with any image URL:
- Tap anywhere on the camera view to reveal the AR video overlay
- No `.mind` file compilation needed for testing

### For Production (True Image Tracking)
To enable real image tracking (video plays automatically when camera detects the specific image):

1. **Compile your target image** to a `.mind` file using the MindAR compiler:
   - Online: https://hiukim.github.io/mind-ar-js-doc/tools/compile
   - Or run locally: `npx mind-ar-image-compiler --input image.jpg --output target.mind`

2. **Upload the `.mind` file to Cloudinary:**
   ```bash
   cloudinary.uploader.upload('target.mind', { resource_type: 'raw', folder: 'ar-targets' })
   ```

3. **Update the ARTarget record** with the `.mind` file URL:
   ```
   PUT /api/ar/target/:orderId/mind-file
   { "targetFileUrl": "https://res.cloudinary.com/.../target.mind" }
   ```

4. The AR viewer auto-detects `.mind` files and enables full tracking mode.

### AR Viewer URL Format
```
/ar-viewer.html?target=IMAGE_OR_MIND_URL&video=VIDEO_URL
```

Example:
```
/ar-viewer.html?target=https://res.cloudinary.com/demo/image/upload/sample.jpg&video=https://res.cloudinary.com/demo/video/upload/dog.mp4
```

---

## 📁 Project Structure

```
ar-gift-website/
├── backend/
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── cloudinary.js        # Cloudinary configuration
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── productController.js
│       │   ├── templateController.js
│       │   ├── presetVideoController.js
│       │   ├── orderController.js
│       │   ├── paymentController.js
│       │   └── arController.js
│       ├── middleware/
│       │   ├── auth.js              # JWT protect + adminOnly
│       │   └── upload.js            # Multer-Cloudinary storage
│       ├── models/
│       │   ├── User.js
│       │   ├── Product.js
│       │   ├── Template.js
│       │   ├── PresetVideo.js
│       │   ├── Order.js
│       │   └── ARTarget.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── products.js
│       │   ├── templates.js
│       │   ├── presetVideos.js
│       │   ├── orders.js
│       │   ├── payments.js
│       │   └── ar.js
│       └── utils/
│           ├── email.js             # Nodemailer HTML emails
│           ├── generateOrderId.js   # ARG-YYYY-XXXXXX generator
│           └── seed.js              # DB seeder (admin + products)
│
└── frontend/
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── package.json
    ├── .env.example
    ├── public/
    │   └── ar-viewer.html           # Standalone WebAR page (MindAR + A-Frame)
    └── src/
        ├── app/
        │   ├── layout.tsx            # Root layout (Inter font, Toaster)
        │   ├── globals.css           # Tailwind base + custom utilities
        │   ├── (customer)/           # Customer-facing pages
        │   │   ├── layout.tsx        # Wraps with Navbar + Footer
        │   │   ├── page.tsx          # Homepage (hero, steps, products, etc.)
        │   │   ├── products/page.tsx
        │   │   ├── customize/[productId]/page.tsx  # 4-step AR customizer
        │   │   ├── scan/page.tsx     # WebAR scan page
        │   │   ├── cart/page.tsx
        │   │   ├── checkout/page.tsx # Razorpay + COD checkout
        │   │   ├── order-confirmation/page.tsx
        │   │   ├── track-order/page.tsx
        │   │   └── contact/page.tsx
        │   ├── scan/ar-viewer/       # Redirects to /ar-viewer.html
        │   └── admin/               # Admin dashboard
        │       ├── login/page.tsx
        │       ├── layout.tsx        # Sidebar nav + auth guard
        │       ├── page.tsx          # Dashboard with stats + chart
        │       ├── products/page.tsx
        │       ├── templates/page.tsx
        │       ├── videos/page.tsx
        │       └── orders/page.tsx
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.tsx        # Responsive nav with cart badge
        │   │   └── Footer.tsx        # Footer with newsletter
        │   ├── products/
        │   │   └── ProductCard.tsx   # Product card with AR badge
        │   └── ui/
        │       ├── Button.tsx        # Variant button component
        │       ├── Modal.tsx         # Animated modal with backdrop
        │       ├── LoadingSpinner.tsx
        │       └── FileUpload.tsx    # Dropzone with preview
        ├── hooks/
        │   ├── useProducts.ts
        │   ├── useTemplates.ts
        │   └── useOrders.ts
        ├── lib/
        │   └── api.ts               # Axios instance + API helpers
        ├── store/
        │   ├── cartStore.ts          # Zustand cart (persisted)
        │   └── authStore.ts          # Zustand auth (persisted)
        └── types/
            └── index.ts              # All TypeScript interfaces
```

---

## 🐛 Troubleshooting

### CORS errors
Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly (no trailing slash).

### Cloudinary upload fails
- Check your Cloudinary credentials in `.env`
- Ensure your Cloudinary plan supports video uploads (free tier supports up to 10GB)

### Razorpay payment not loading
- Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in frontend `.env.local`
- Use test keys (`rzp_test_...`) for development

### Gmail SMTP fails
- Enable 2-Factor Authentication on your Gmail account
- Generate an App Password: Google Account → Security → App Passwords
- Use the 16-character App Password in `EMAIL_PASS`

### AR not working on mobile
- Ensure HTTPS is enabled (required for camera access on mobile)
- Use a `.mind` compiled target file for production image tracking
- Test on Chrome (Android) or Safari (iOS)

---

## 📄 License

MIT License. Free to use for personal and commercial projects.

---

## 🙏 Credits

- [MindAR.js](https://github.com/hiukim/mind-ar-js) – WebAR image tracking
- [A-Frame](https://aframe.io/) – 3D web framework
- [Razorpay](https://razorpay.com/) – Payment gateway
- [Cloudinary](https://cloudinary.com/) – Media management
- [Framer Motion](https://www.framer.com/motion/) – React animations
- [Tailwind CSS](https://tailwindcss.com/) – Utility CSS framework

---

Built with ❤️ for magical gifting experiences.
