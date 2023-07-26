import { Navigate, Outlet, NavLink } from "react-router-dom";
import UserContext from '../utils/UserContext';
import { useContext } from 'react';

function ProtectedRoute({children}) {
    const {currentUser} = useContext(UserContext);
    console.log("protected route: "+ currentUser);
    if(currentUser)  {console.log("protected route id: "+ currentUser.username)};
    if(!currentUser) {
        return <Navigate to="/login" />
    }

    return (
        <>
        <h1>Protected Route</h1>
        <NavLink to="">Dashboard</NavLink>
        <NavLink to="chatbuddy">ChatBuddy</NavLink>
        <NavLink to="study">Study</NavLink>
        <NavLink to="review">Review</NavLink>
        <Outlet />
        </>
        )
}
export default ProtectedRoute;