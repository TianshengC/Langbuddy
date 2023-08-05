import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { grey } from '@mui/material/colors';


function Copyright() {
    return (
      <Typography align="center" variant="caption" display="block" gutterBottom color="text.secondary">
        {'Copyright © '}
        <Link color="inherit" href="/">
            LangBuddy
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    );
  }
  
  function Footer() {
    return (
          <Box
            component="footer"
            sx={{
              pt: 0.5,
              px: 0,
              backgroundColor: grey[200],
              position:'fixed', 
              height: '20px',
              width: '100%',
              bottom: '0px',
            }}
          >
            <Container maxWidth="sm">
              <Copyright />
            </Container>
          
          </Box>
    );
  }

export default Footer;

