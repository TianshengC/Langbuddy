import { Navigate, Outlet, NavLink } from "react-router-dom";

function ProtectedRoute({children, user}) {
    
    if(!user) {
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