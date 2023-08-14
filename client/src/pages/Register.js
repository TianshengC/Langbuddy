import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import UserContext from '../utils/UserContext';

function Register() {
  const navigate = useNavigate();
  const {currentUser} = useContext(UserContext);
  if(currentUser) {
    navigate('/dashboard');
  }

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    motherLanguage: "",
  });

  const [error, setError] = useState(null);

  const emailRegex = /^\S+@\S+\.\S+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  
  const validate = (data) => {
    const {username, email, password, confirmPassword, motherLanguage} = data;
    if (username === '') {
      return 'Username is required'; 
    } else if (!emailRegex.test(email)) {
      return 'Email must be a valid email address'; 
    } else if (!passwordRegex.test(password)) {
      return 'Password must be at least 8 characters and contain at least one letter and one number'; 
    } else if (confirmPassword !== password) {
      return 'Confirm password does not match password'; 
    } else if (motherLanguage === "") {
      return 'Mother language is required';
    }
    return null;
  };

  const handleChange = (event) => {
    const updatedUserData = {
      ...userData,
      [event.target.name]: event.target.value,
    };

    setUserData(updatedUserData);
    setError(validate(updatedUserData));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validate(userData);
    if (error) {
      setError(error);
      return; 
    }

    const userFormatedData = {
      username: userData.username,
      user_email: userData.email,
      password: userData.password,
      mother_language: userData.motherLanguage,
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userFormatedData)
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const data = await response.json();
          errorMessage = data.message;
        } catch (jsonError) {
          errorMessage = 'Failed to parse server response';
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      console.log("Registered user: " + data.username);
      navigate('/login');
    } catch (err) {
      setError('There was an error processing your request. Please try again.');
      console.error(err.message);
    }
  };

  return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <AppRegistrationIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={userData.username}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={userData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={userData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="comfirm-password"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                <InputLabel id="mother-language-label">Mother Language</InputLabel>
                <Select
                  labelId="mother-language-label"
                  id="mother-language"
                  name="motherLanguage"
                  label="Mother Language"
                  autoComplete="mother-language"
                  value={userData.motherLanguage}
                  onChange={handleChange}
                >
                  <MenuItem value={"Chinese"}>Chinese</MenuItem>
                  <MenuItem value={"Spanish"}>Spanish</MenuItem>
                  <MenuItem value={"French"}>French</MenuItem>
                </Select>
                </FormControl>
              </Grid>
              {error && (<Grid item xs={12}>
                <Typography component="h1" variant="body2" color="error" >
                   {error}
                </Typography>
              </Grid>)}
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onSubmit={handleSubmit}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Log in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
  );
}


export default Register;