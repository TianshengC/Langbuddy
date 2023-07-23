import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';


function Footer(){
    return (
        <Paper sx={{position:'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <Typography align="center" variant="caption" display="block" gutterBottom>© 2023 Justin Chen. All rights reserved.</Typography>
        </Paper>
    )
}

export default Footer;