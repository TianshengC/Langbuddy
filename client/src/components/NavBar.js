import {NavLink} from 'react-router-dom';

function NavBar() {
    return (
    <div>
        <h1>NavBar</h1>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contactus">Contact Us</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
    </div>
    )
}

export default NavBar;

