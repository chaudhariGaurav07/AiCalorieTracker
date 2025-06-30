🥗 AI Calorie Tracker Backend

A full-featured backend for tracking calories using AI-powered meal analysis, image uploads, barcode scanning, and step-count-based calorie burn. Built with Node.js, Express, and MongoDB.

🚀 Features

🔐 User Authentication (Register, Login, Forgot/Reset Password)

📸 Upload meal photos (via Multer + Cloudinary)

🤖 AI-powered calorie & macronutrient analysis from meal text

📦 Barcode scanner support (WIP)

🏃 Step counter & calorie burn logging

🗕️ Daily calorie logs with totals

📊 Progress tracking API

🧪 Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (via Mongoose)

AI: GPT-based meal analysis

Image Upload: Multer, Cloudinary

Authentication: JWT

Deployment: Render

📁 Project Structure

src/
├── config/                 # Cloudinary config
├── controllers/           # Route controllers (auth, meals, barcode, AI, etc.)
├── db/                    # MongoDB connection
├── middlewares/           # JWT auth, multer, error handling
├── models/                # Mongoose schemas (User, DailyLog, CalorieGoal)
├── routes/                # Express routers
├── utils/                 # Utility functions (AI prompt, sendMail, error classes)
├── app.js                 # Express app
└── index.js               # App entrypoint

🔧 Environment Variables (.env)

Create a .env file in root with the following:

PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_app_password

📦 Installation

# Clone the repo
git clone https://github.com/chaudhariGaurav07/AiCalorieTracker.git
cd AiCalorieTracker

# Install dependencies
npm install

# Run locally
npm run dev

🌐 API Endpoints (Short Overview)

Auth

Method

Endpoint

Description

POST

/api/v1/user/register

Register a new user

POST

/api/v1/user/login

Login and get token

POST

/api/v1/user/forgot-password

Send reset email

POST

/api/v1/user/reset-password/:token

Reset password

Meals

Method

Endpoint

Description

POST

/api/v1/meal/add

Add meal (AI analysis)

POST

/api/v1/meal/add-photo

Upload meal photo with entry

PUT

/api/v1/meal/edit/:date/:index

Edit a specific meal entry

DELETE

/api/v1/meal/delete/:date/:index

Delete a specific meal

Daily Log

Method

Endpoint

Description

GET

/api/v1/log/today

Get today's log

GET

/api/v1/log/history

Get all daily logs

Step Tracker

Method

Endpoint

Description

POST

/api/v1/step/add

Add steps for calorie burn

GET

/api/v1/step/today

View today's step data

🧪 Testing with Postman

Use Bearer Token auth after login. Example Postman collection available soon.

📤 Deployment (Render)

Push to GitHub

Create new Web Service on Render

Set environment variables in Render > Environment

Add this to your package.json:

"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}

Set Start Command to:

npm start

✅ Todo / Upcoming



👨‍💻 Author

Gaurav ChaudhariGitHub Profile

📄 License

MIT – Feel free to use & modify!