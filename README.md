<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/3514/3514491.png" alt="ShopNest Logo" width="80" />
  <h1>ShopNest - Full-Stack MERN E-Commerce App</h1>
</div>

---

A full-stack e-commerce web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Supports product browsing, cart management, secure payments, and an admin dashboard for order and inventory management.

🔗 **Live Demo:** https://shopnest-frontend-cne6.onrender.com/
> Note: hosted on Render's free tier — the app may take 20–30 seconds to load on first visit due to cold start.

## Features
- User authentication with JWT
- Role-based access control (User / Admin)
- Product catalog with cart and wishlist
- Razorpay payment integration (2-step verification)
- OTP-based email verification via Nodemailer
- Image upload and management with Cloudinary + Multer
- Admin dashboard with order, revenue, and user analytics
- 3-stage order lifecycle: Pending → Shipped → Delivered

## Tech Stack
- **Frontend:** React.js, Redux Toolkit, Material UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, Firebase
- **Payments:** Razorpay
- **File Storage:** Cloudinary, Multer

## Running Locally

1. Clone the repository and install dependencies in both `backend/` and `frontend/`.
2. Create a `.env` file inside `backend/` with the following variables (see `.env.example`):
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
3. From the root folder, run:
```bash
   npm install
   npm run dev
```
   This starts the backend (port 5000) and frontend (port 3000) together.
4. To seed the database with sample products, run:
```bash
   npm run seed
```

## API Testing
A Postman collection (`ShopNest_Postman_Collection.json`) is included in the repo — import it into Postman to test all API endpoints. The `{{token}}` variable maps to a valid JWT for testing protected routes.

## Deployment
Deployed on Render as a single Node service — the Express backend serves the built React frontend from `/frontend/build` in production.

## Author
Pratik Kashyap — [LinkedIn](https://www.linkedin.com/in/pratik0612) | [GitHub](https://github.com/Codeitpratik)
