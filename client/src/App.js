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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { cyan, lightBlue } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';

export const theme = createTheme({
  palette: {
    primary: {
      main: cyan[400],
    },
    secondary: {
      main: lightBlue[500],
    },
  },
});


function App() {

  const [user, setUser] = useState('Tom');
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
      <CssBaseline />
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
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
