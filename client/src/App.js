import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { cyan, lightBlue, grey } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import UserContext from './utils/UserContext';

export const theme = createTheme({
  palette: {
    primary: {
      main: cyan[400],
    },
    secondary: {
      main: lightBlue[500],
    },
    default: {
      main: grey[500],
    },
  },
});


function App() {

  // const [currentUser, setCurrentUser] = useState({ user_id: null, username: null });
  const [currentUser, setCurrentUser] = useState(null);
  const [authchecked, setAuthchecked] = useState(false);//to prevent the page from rendering before the token is validated

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/me`, {
          method: 'GET',
          credentials: 'include', // Ensures the request includes the cookie
        });

        if (!response.ok) {
          throw new Error('Token validation failed');
        }

        const data = await response.json();
        await setCurrentUser({ user_id: data.id_user, username: data.username });
      } catch (err) {
        console.error(err.message);
      }finally {
        setAuthchecked(true);
      }
    };

    validateToken();
  }, []); 

  if (!authchecked) {
    return null;
  }


  return (
    <UserContext.Provider value={{currentUser, setCurrentUser}}>
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

          <Route path="dashboard" element={<ProtectedRoute currentUser={currentUser}/>}>
            <Route index element={<Dashboard />} />
            <Route path="chatbuddy" element={<ChatBuddy />} />
            <Route path="study" element={<Study />} />
            <Route path="review" element={<Review />} />
          </Route>
        </Route>
      </Routes>
      </ThemeProvider>
    </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
