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
              mt: 'auto',
              backgroundColor: grey[200],
              position:'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0
            }}
          >
            <Container maxWidth="sm">
              <Copyright />
            </Container>
          
          </Box>
    );
  }

  {/* <Paper sx={{position:'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
<Typography align="center" variant="caption" display="block" gutterBottom>© 2023 Justin Chen. All rights reserved.</Typography>
</Paper> */}

export default Footer;

