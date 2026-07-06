# HostelOS

HostelOS is a modern full-stack hostel management system designed to simplify hostel administration for students and administrators. It replaces manual workflows with a centralized platform that manages room allocations, bookings, maintenance requests, student records, payments, and hostel analytics.

The application provides dedicated dashboards for administrators and students, enabling efficient hostel operations through a clean and responsive interface.

## Live Demo

https://hostelos-three.vercel.app/

---

## Features

### Student Portal

- Secure authentication
- Browse available rooms
- Book hostel rooms
- View booking status
- Submit maintenance requests
- Track maintenance progress
- View room details
- Manage personal profile

### Admin Portal

- Dashboard with hostel analytics
- Room management
- Student management
- Booking approval and rejection
- Maintenance request management
- Occupancy tracking
- Payment monitoring
- Real-time hostel statistics

---

## Tech Stack

### Frontend

- React
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB

### Authentication

- JWT Authentication

### Deployment

- Frontend: Vercel
- Backend: Render

---

## Project Structure

```
HostelOS
│
├── client/
│   ├── public/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── utils/
│
└── README.md
```

---

## Getting Started

### Prerequisites

Before running the project, ensure you have installed:

- Node.js
- npm
- MongoDB

---

## Installation

Clone the repository

```bash
git clone https://github.com/nikshay17/HostelOS.git
```

Move into the project directory

```bash
cd HostelOS
```

### Install Frontend

```bash
cd client
npm install
```

### Install Backend

```bash
cd ../server
npm install
```

---

## Environment Variables

Create a `.env` file inside the server directory and configure the required environment variables.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email

EMAIL_PASS=your_email_password
```

---

## Running the Project

### Start Backend

```bash
cd server
npm start
```

### Start Frontend

```bash
cd client
npm start
```

The frontend will run on

```
http://localhost:3000
```

The backend will run on

```
http://localhost:5000
```

---

## Dashboard Overview

The administrator dashboard provides a quick overview of hostel operations, including:

- Total rooms
- Available rooms
- Occupied rooms
- Active bookings
- Student records
- Pending maintenance requests
- Payment status
- Hostel occupancy analytics

Students can access their own dashboard to manage bookings, room information, maintenance requests, and profile details.

---

## Future Improvements

Some planned enhancements include:

- Online payment integration
- Email notifications
- Visitor management
- Hostel leave management
- Complaint prioritization
- Roommate preference system
- Analytics with interactive charts
- Mobile application support

---

## Deployment

Frontend

https://hostelos-three.vercel.app/

---

## Contributing

Contributions are welcome.

If you would like to improve the project:

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---


