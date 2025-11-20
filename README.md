# Mutual Skill Exchange - Free Peer Learning Platform

A comprehensive full-stack web application for peer-to-peer skill exchange without any costs.

## Features

- **User Registration & Authentication** - Secure signup and login with JWT tokens
- **Skill Management** - Add skills you know and skills you want to learn
- **Smart Matching** - Find users based on complementary skills
- **Connection System** - Request skill swaps with other users
- **Messaging** - Direct communication with potential learning partners
- **Reviews & Ratings** - Build trust through community feedback
- **Gamification** - Earn badges and build reputation
- **Search & Filter** - Find users by skills, interests, and location

## Tech Stack

**Backend:**
- Node.js & Express.js
- SQLite3 Database
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- Vanilla JavaScript
- Bootstrap 5
- Responsive Design

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Local Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd skill-exchange-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the server**
   \`\`\`bash
   npm start
   \`\`\`
   Server will run on `http://localhost:5000`

4. **Seed sample data (optional)**
   \`\`\`
   Visit http://localhost:5000/api/seed
   \`\`\`

5. **Access the application**
   Open `http://localhost:5000` in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update profile
- `GET /api/search` - Search users

### Skills
- `GET /api/skills` - Get all available skills
- `POST /api/users/:userId/skills` - Add skill to user

### Connections
- `GET /api/matches/:userId` - Find skill matches
- `POST /api/connections` - Create connection request
- `GET /api/users/:userId/connections` - Get user connections
- `PUT /api/connections/:connectionId` - Update connection status

### Messages
- `POST /api/messages` - Send message
- `GET /api/users/:userId/messages` - Get messages

### Reviews
- `POST /api/reviews` - Add review

## Project Structure

\`\`\`
skill-exchange-platform/
├── server.js           # Express server & API routes
├── database.db         # SQLite database (auto-created)
├── client/
│   └── public/
│       ├── index.html  # HTML entry point
│       ├── app.js      # Frontend logic
│       └── styles.css  # Styling
├── package.json        # Dependencies
└── README.md           # Documentation
\`\`\`

## Database Schema

- **users** - User accounts and profiles
- **skills** - Available skills catalog
- **userSkills** - User skill assignments (many-to-many)
- **connections** - Skill swap requests/sessions
- **reviews** - User ratings and feedback
- **messages** - Direct messaging
- **badges** - Gamification/achievements

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Input validation and sanitization
- CORS enabled
- SQL injection prevention

## Future Enhancements

- Video calling integration
- Real-time notifications
- Advanced matching algorithm
- User reputation system
- Skill verification system
- Group workshops
- Mobile app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC License - feel free to use for personal and commercial projects.

## Support

For issues and questions, please create an issue in the repository.

---

**Happy Learning! 🚀**
