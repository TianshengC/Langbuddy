import { Navigate, Outlet, useNavigate } from "react-router-dom";
import UserContext from '../utils/UserContext';
import { useContext, useState } from 'react';
import { Grid } from '@mui/material';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Box from '@mui/material/Box';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';


function ProtectedRoute() {
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);

    const actions = [
      { icon: <GridViewRoundedIcon sx={{ fontSize: 40 }}/>, name: 'Dashboard', path: '' },
      { icon: <SmartToyIcon sx={{ fontSize: 40 }}/>, name: 'ChatBuddy', path: 'chatbuddy' },
      { icon: <BorderColorRoundedIcon sx={{ fontSize: 40 }}/>, name: 'Study', path: 'study' },
      { icon: <AutoStoriesRoundedIcon sx={{ fontSize: 40 }}/>, name: 'Review', path: 'review' },
    ];
  
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
  
    return (
      <Grid container spacing={2}>
        <Grid item xs={1}>
          <Box sx={{ mt: 2, ml: 2 }}>  {/* Adjust as needed */}
            <SpeedDial
              ariaLabel="Dashboard"
              icon={<SpeedDialIcon icon={<FormatListBulletedIcon />} openIcon={<PlaylistPlayIcon />} />}
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              direction="down"
                sx={{ position: 'fixed', top: 100, left: 25 }}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  tooltipOpen
                  tooltipPlacement="right"
                  onClick={() => navigate(`${action.path}`)}
                  sx={{
                      '& .MuiSpeedDialAction-fab': {
                          width: 56, 
                          height: 56 
                      } 
                    }}
                />
              ))}
            </SpeedDial>
          </Box>
        </Grid>
        <Grid item xs={11}>
          <Outlet />
        </Grid>
      </Grid>
    );
  }
  
  export default ProtectedRoute;