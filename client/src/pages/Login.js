import { NavLink } from "react-router-dom";

function Login() {
  return (
    <div>
        <h1>Login</h1>
        <NavLink to="../dashboard">Dashboard</NavLink>
    </div>
    );
}   

export default Login;