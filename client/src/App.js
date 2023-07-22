import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import SharedLayout from './pages/SharedLayout';
import Home from './pages/Home';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ChatBuddy from './pages/ChatBuddy';
import Study from './pages/Study';
import Review from './pages/Review';


function App() {

  const [user, setUser] = useState('Tom');
  return (
    <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contactus" element={<ContactUs />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route path="dashboard" element={<ProtectedRoute user={user}/>}>
            <Route index element={<Dashboard />} />
            <Route path="chatbuddy" element={<ChatBuddy />} />
            <Route path="study" element={<Study />} />
            <Route path="review" element={<Review />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
