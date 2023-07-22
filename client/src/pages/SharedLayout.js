import Footer from "../components/Footer"
import NavBar from "../components/NavBar"
import { Outlet } from "react-router-dom";

function SharedLayout(){

    return (
        <div className="SharedLayout">
            <NavBar />
             <Outlet />
            <Footer />
        </div>
    )
}

export default SharedLayout;