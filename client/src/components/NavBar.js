import {Link} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import { ColorButton,OutlineButton, TextButton } from './Buttons';

function NavBar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
            
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

            <Link to="/" className="link">
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center' }}>

            <Diversity2Icon sx={{ width:40, height:40, ml:3, mr:0.5 }}/>
            <Typography variant="h6" sx={{fontFamily: 'Pacifico'}}>LangBuddy</Typography>
            </Box>
            </Link>
            
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center'}}>
            
            <Link to="/"><TextButton variant="text" sx={{m:2 }}>
            <Typography variant="h6">Home</Typography>
            </TextButton></Link>

            <Link to="/about"><TextButton variant="text" sx={{m:2 }}>
            <Typography variant="h6">About</Typography>
            </TextButton></Link>

            <Link to="/contactus"><TextButton variant="text" sx={{m:2 }}>
            <Typography variant="h6">Contact</Typography>
            </TextButton></Link>

            <Link to="/login"><OutlineButton variant="outlined" sx={{ m:2 }}>
            <Typography variant="h6">Log in</Typography>
            </OutlineButton></Link>
            
            <Link to="/register"><ColorButton variant="contained" sx={{m:2}}>
            <Typography variant="h6">Register</Typography>
            </ColorButton></Link>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    )
}

export default NavBar;

