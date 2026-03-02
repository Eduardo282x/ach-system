import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router";

export const Layout = () => {
    const navigate = useNavigate();

    const validateToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }

    useEffect(() => {
        validateToken();
    }, []);

    return (
        <div><Outlet /></div>
    )
}
