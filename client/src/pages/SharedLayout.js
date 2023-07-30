import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import { Outlet } from "react-router-dom";
import { Box } from "@mui/system";

function SharedLayout(){

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh' 
          }}>
              <NavBar />
              <Box sx={{ flexGrow: 1 }}> 
                <Outlet />
              </Box>
              <Footer />
          </Box>
      )
}

export default SharedLayout;