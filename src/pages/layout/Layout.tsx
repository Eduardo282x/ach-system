import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

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
        <div className="w-screen h-full flex flex-col">
            <Header />
            <div className="flex-1 bg-gray-200 p-4">
                <Outlet />
            </div>
            <Footer/>
        </div>
    )
}
