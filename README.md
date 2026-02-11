# Handyman Platform API

A RESTful API built with Node.js, Express, and PostgreSQL for managing a handyman services platform with JWT authentication.

## Features

- ✅ JWT Authentication (Register, Login, Profile Management)
- ✅ User Management (Profile Images, Multiple Phone Numbers)
- ✅ Skills Management (Add, Update, Delete Skills)
- ✅ Handyman Profiles (Link Skills with Experience)
- ✅ Work Portfolio (Upload Work with Images)
- ✅ Review System (User Reviews & Work Reviews)
- ✅ Input Validation
- ✅ Error Handling
- ✅ CORS Support

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd handyman-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up database

Create a PostgreSQL database and run the schema:

```sql
-- Run the SQL schema provided in the project
-- (The complete schema from your original request)
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=handyman_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:3000
```

### 5. Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected routes require an `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 🔐 Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

---

### 👤 User Management

#### Add Phone Number
```http
POST /api/users/phone
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phone_number": "+1234567890",
  "is_primary": true
}
```

#### Update Phone Number
```http
PUT /api/users/phone/:phoneId
Authorization: Bearer <token>
```

#### Delete Phone Number
```http
DELETE /api/users/phone/:phoneId
Authorization: Bearer <token>
```

#### Update Profile Image
```http
PUT /api/users/profile-image
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "profile_img_url": "https://example.com/image.jpg"
}
```

#### Delete Profile Image
```http
DELETE /api/users/profile-image
Authorization: Bearer <token>
```

---

### 🛠️ Skills

#### Get All Skills
```http
GET /api/skills
```

#### Create Skill
```http
POST /api/skills
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "skill_name": "Plumbing"
}
```

#### Add Skill to Handyman
```http
POST /api/skills/handyman
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "skill_id": 1,
  "experience": 5
}
```

#### Get Handyman Skills
```http
GET /api/skills/handyman/:userId
```

#### Update Handyman Skill
```http
PUT /api/skills/handyman/:skillId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "experience": 7
}
```

#### Delete Handyman Skill
```http
DELETE /api/skills/handyman/:skillId
Authorization: Bearer <token>
```

---

### 💼 Work Portfolio

#### Create Work
```http
POST /api/works
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Kitchen Renovation",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

#### Get Works by User
```http
GET /api/works/user/:userId
```

#### Get Single Work
```http
GET /api/works/:workId
```

#### Update Work
```http
PUT /api/works/:workId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Kitchen Renovation"
}
```

#### Delete Work
```http
DELETE /api/works/:workId
Authorization: Bearer <token>
```

#### Add Image to Work
```http
POST /api/works/:workId/images
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "work_img_url": "https://example.com/new-image.jpg"
}
```

#### Delete Image from Work
```http
DELETE /api/works/:workId/images
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "work_img_url": "https://example.com/image-to-delete.jpg"
}
```

---

### ⭐ Reviews

#### Create User Review
```http
POST /api/reviews/user
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reviewee_id": 2,
  "review_text": "Great handyman! Very professional and timely."
}
```

#### Get User Reviews
```http
GET /api/reviews/user/:userId
```

#### Update User Review
```http
PUT /api/reviews/user/:reviewId
Authorization: Bearer <token>
```

#### Delete User Review
```http
DELETE /api/reviews/user/:reviewId
Authorization: Bearer <token>
```

#### Create Work Review
```http
POST /api/reviews/work
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "work_id": 1,
  "rating": 5,
  "review_text": "Excellent work! Highly recommend."
}
```

#### Get Work Reviews
```http
GET /api/reviews/work/:workId
```

#### Update Work Review
```http
PUT /api/reviews/work/:reviewId
Authorization: Bearer <token>
```

#### Delete Work Review
```http
DELETE /api/reviews/work/:reviewId
Authorization: Bearer <token>
```

---

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error Response Format:
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Project Structure

```
handyman-api/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── skillController.js   # Skills management
│   ├── workController.js    # Work portfolio
│   └── reviewController.js  # Reviews
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── validate.js         # Request validation
│   └── errorHandler.js     # Error handling
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   ├── skillRoutes.js      # Skills endpoints
│   ├── workRoutes.js       # Work endpoints
│   └── reviewRoutes.js     # Review endpoints
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
└── server.js               # Entry point
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection via parameterized queries
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Testing

You can test the API using tools like:
- **Postman** - Import the endpoints and test
- **Thunder Client** - VS Code extension
- **cURL** - Command line testing

Example cURL request:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on the GitHub repository.
