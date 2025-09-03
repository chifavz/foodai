# FoodAI - Connect Chefs & Customers with AI Waitress

FoodAI is a modern web application that connects talented chefs with food lovers through an intelligent AI waitress. Experience seamless dining where culinary art meets cutting-edge technology.

## ✨ Features

### 🍽️ **For Everyone**
- **Beautiful Landing Page** - Choose your experience as a Chef or Customer
- **AI Waitress (Sofia)** - Intelligent chat assistant for menu recommendations and dining guidance
- **Responsive Design** - Works perfectly on all devices
- **Modern UI** - Built with Tailwind CSS for a sleek, professional look

### 👨‍🍳 **For Chefs**
- **Chef Dashboard** - Manage your culinary creations and orders
- **Menu Management** - Add, edit, and toggle availability of dishes
- **Order Tracking** - Real-time order management with status updates
- **Analytics** - Track daily orders, revenue, ratings, and menu performance

### 🍴 **For Customers** 
- **Browse Menu** - Discover amazing dishes from verified chefs
- **Category Filtering** - Filter by Appetizer, Main Course, Dessert
- **Smart Cart** - Add items, adjust quantities, and see real-time totals
- **Chef Profiles** - See ratings and specialties for each chef
- **Interactive Ordering** - Seamless ordering experience

### 🤖 **AI Waitress - Sofia**
- **Natural Conversations** - Ask about menu items, dietary restrictions, and recommendations
- **Quick Questions** - Pre-built buttons for common inquiries
- **Contextual Responses** - Intelligent answers based on menu and chef information
- **24/7 Availability** - Always ready to help with your dining experience

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/chifavz/foodai.git
cd foodai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## 🧪 Available Scripts

### `npm start`
Runs the app in development mode. The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. The build is minified and optimized for the best performance.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, React Router DOM
- **Styling**: Tailwind CSS
- **Build Tool**: Create React App
- **Testing**: Jest, React Testing Library

### Project Structure
```
src/
├── components/
│   ├── LandingPage.js      # Main landing page with role selection
│   ├── ChefDashboard.js    # Chef management interface
│   ├── CustomerInterface.js # Customer browsing and ordering
│   └── AIWaitress.js       # AI chat interface
├── App.js                  # Main app with routing
└── index.js               # App entry point
```

## 🎨 Design System

The app uses a consistent color scheme:
- **Primary Orange**: Chef-focused elements (#ea580c)
- **Primary Blue**: Customer-focused elements (#2563eb)  
- **Purple**: AI Waitress elements (#9333ea)
- **Gradients**: Warm orange-to-red for main backgrounds

## 🌟 Key Features Implemented

### Navigation Flow
1. **Landing Page** → Choose Chef or Customer experience
2. **Chef Dashboard** → Manage menu and orders + Access AI Waitress
3. **Customer Interface** → Browse menu and add to cart + Access AI Waitress
4. **AI Waitress** → Chat interface accessible from any page

### Mock Data
The app includes realistic mock data for:
- Menu items with chef information, ratings, and prices
- Order history with different statuses
- Chef profiles and specialties
- AI responses for common dining scenarios

## 🚀 Deployment

The app can be deployed to any static hosting service:

```bash
npm run build
```

The `build` folder contains the optimized production build ready for deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Screenshots

### Landing Page
A welcoming interface that lets users choose their role and learn about FoodAI's features.

### Chef Dashboard  
Comprehensive menu management and order tracking for culinary professionals.

### Customer Interface
Intuitive browsing experience with smart cart functionality and chef profiles.

### AI Waitress
Sofia, the intelligent AI assistant, ready to help with menu questions and recommendations.

## 📄 License

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

---

**FoodAI** - Where Culinary Art Meets Artificial Intelligence 🍽️🤖
