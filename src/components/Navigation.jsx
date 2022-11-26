import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Passwords from "./Passwords";

const Navigation = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<Login />} />
                <Route exact path="/senhas" element={<Passwords />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Navigation;
