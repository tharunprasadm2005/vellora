# Ecommerce Project Flow 🚀

## 1. User Opens Website

Frontend starts from:

```bash id="rnqvbg"
Home Page
```

User sees:

* Navbar
* Categories
* Products
* Hero banners
* Cart icon
* Login option

---

# 2. User Registration

Flow:

```text
Register Page
   ↓
Enter Name, Email, Password
   ↓
Frontend sends POST request
   ↓
Backend API receives data
   ↓
Password encrypted using bcrypt
   ↓
User stored in MongoDB
   ↓
JWT token generated
   ↓
User logged in
```

API Used:

```bash id="q6g57g"
POST /api/users/register
```

---

# 3. User Login

Flow:

```text
Login Page
   ↓
Enter Email + Password
   ↓
Frontend sends login request
   ↓
Backend checks credentials
   ↓
JWT token generated
   ↓
Token stored in localStorage
   ↓
User authenticated
```

API Used:

```bash id="3gdyn4"
POST /api/users/login
```

---

# 4. Homepage Product Loading

Flow:

```text
Home Page Loads
   ↓
React useEffect runs
   ↓
Axios sends GET request
   ↓
Backend fetches products from MongoDB
   ↓
Products returned to frontend
   ↓
Products displayed in cards
```

API Used:

```bash id="zexmca"
GET /api/products
```

---

# 5. Add To Cart

Flow:

```text
User clicks "Add To Cart"
   ↓
Frontend checks token
   ↓
Axios POST request sent
   ↓
JWT middleware verifies user
   ↓
Product added to cart collection
   ↓
Success response returned
```

API Used:

```bash id="c8i0of"
POST /api/cart
```

---

# 6. View Cart

Flow:

```text
User opens Cart Page
   ↓
Frontend sends GET request
   ↓
Backend verifies JWT token
   ↓
Cart items fetched from MongoDB
   ↓
Cart displayed with total price
```

API Used:

```bash id="e3e5ep"
GET /api/cart
```

---

# 7. Remove Product From Cart

Flow:

```text
User clicks Remove button
   ↓
DELETE request sent
   ↓
Backend removes product
   ↓
Updated cart fetched again
```

API Used:

```bash id="u2x2m6"
DELETE /api/cart/:productId
```

---

# 8. Place Order

Flow:

```text
User clicks Checkout
   ↓
Frontend sends POST request
   ↓
Backend creates order document
   ↓
Cart products moved to orders
   ↓
Cart cleared
   ↓
Order success message
```

API Used:

```bash id="v5o74m"
POST /api/orders
```

---

# 9. View Orders

Flow:

```text
Orders Page Opens
   ↓
Frontend requests order history
   ↓
Backend fetches user orders
   ↓
Orders displayed
```

API Used:

```bash id="v9sjrc"
GET /api/orders
```

---

# Complete Architecture Flow 🏗️

```text
Frontend (React + Tailwind)
        ↓
Axios API Calls
        ↓
Backend (Node + Express)
        ↓
JWT Authentication Middleware
        ↓
MongoDB Database
        ↓
Response back to Frontend
```

---

# Database Flow 📦

## Collections Created

### Users Collection

Stores:

* name
* email
* password

---

### Products Collection

Stores:

* product name
* image
* price
* description

---

### Cart Collection

Stores:

* userId
* products
* quantity

---

### Orders Collection

Stores:

* ordered products
* total amount
* userId
* order date

---

# Authentication Flow 🔐

```text
Login/Register
      ↓
JWT Token Generated
      ↓
Stored in localStorage
      ↓
Sent in Authorization Header
      ↓
Backend verifies token
      ↓
Protected routes accessed
```

---

# Frontend Folder Flow 📁

```text
src/
 ├── pages/
 │     ├── Home.jsx
 │     ├── Login.jsx
 │     ├── Register.jsx
 │     ├── Cart.jsx
 │     └── Orders.jsx
 │
 ├── App.jsx
 ├── main.jsx
 └── index.css
```

---

# Backend Folder Flow 📁

```text
backend/
 ├── models/
 │     ├── User.js
 │     ├── Product.js
 │     ├── Cart.js
 │     └── Order.js
 │
 ├── routes/
 │     ├── userRoutes.js
 │     ├── productRoutes.js
 │     ├── cartRoutes.js
 │     └── orderRoutes.js
 │
 ├── middleware/
 │     └── authMiddleware.js
 │
 ├── config/
 │     └── db.js
 │
 └── server.js
```

---

# Current Project Level 📈

Your project now includes:

* Frontend
* Backend
* Database
* Authentication
* API Integration
* Cart Logic
* Order Logic
* Responsive UI
