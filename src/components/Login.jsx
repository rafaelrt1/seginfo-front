import { useEffect, useState } from "react";
import CryptoES from "crypto-es";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
const KEY = process.env.REACT_APP_KEY;
const IP = process.env.REACT_APP_IP;

const Login = () => {
    const [password, setPassword] = useState("");
    const [createPassword, setCreatePassword] = useState();
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [hasInternet, setHasInternet] = useState(false);
    const history = useNavigate();

    const encrypt = (data) => {
        const encrypted = CryptoES.SHA3(data).toString();
        // const encrypted = CryptoES.AES.encrypt(data, KEY).toString();
        return encrypted;
    };

    // const decrypt = (dataToDecrypt) => {
    //     const passDecripted = CryptoES.AES.decrypt(dataToDecrypt, KEY);
    //     return passDecripted.toString(CryptoES.enc.Utf8);
    // };

    const registerPassword = (encryptedPassword) => {
        try {
            fetch(`http://${IP}:5000/app-password`, {
                method: "POST",
                mode: "cors",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify({ password: encryptedPassword }),
            })
                .then((res) => res.json())
                .then(
                    (result) => {
                        setCreatePassword(false);
                    },
                    (error) => {
                        console.error(error);
                    }
                );
        } catch (e) {
            console.error(e);
        }
    };

    const tryLogin = async (encryptedPassword) => {
        try {
            const request = await fetch(`http://${IP}:5000/login`, {
                method: "POST",
                mode: "cors",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify({ password: encryptedPassword }),
            });

            const response = await request.json();
            if (response.status === "OK") {
                history("/senhas");
            } else {
                alert("Senha incorreta");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openApp = (e) => {
        e.preventDefault();
        const passEncrypted = encrypt(password);
        tryLogin(passEncrypted);
        // const passDecrypted = decrypt(passEncrypted);
        // if (password === passDecrypted) {
        //     history("/senhas");
        // } else {
        //     alert("Senha incorreta");
        // }
    };

    const configPassword = (e) => {
        e.preventDefault();
        const passEncrypted = encrypt(password);
        registerPassword(passEncrypted);
    };

    useEffect(() => {
        const searchUser = async () => {
            try {
                const request = await fetch(`http://${IP}:5000/user`, {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                });
                const response = await request.json();
                if (response === "registered") {
                    setCreatePassword(false);
                } else {
                    setCreatePassword(true);
                }
            } catch (e) {
                console.error(e);
            }
        };
        searchUser();
    }, []);

    return (
        <div className="container">
            {createPassword ? (
                <form onSubmit={configPassword} className="container">
                    <h1 className="passwordLabel">Configurar senha:</h1>
                    <label htmlFor="password-config">Senha:</label>
                    <div className="password">
                        <input
                            id="password-config"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="passwordInput"
                            type={visiblePassword ? "text" : "password"}
                        />
                        {visiblePassword ? (
                            <VisibilityOffIcon
                                sx={{
                                    position: "relative",
                                    left: "-34px",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setVisiblePassword(false);
                                }}
                            />
                        ) : (
                            <VisibilityIcon
                                sx={{
                                    position: "relative",
                                    left: "-34px",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setVisiblePassword(true);
                                }}
                            />
                        )}
                    </div>
                    <button
                        type="submit"
                        className="button buttonEnter"
                        onClick={configPassword}
                    >
                        <span className="textStyle">Criar</span>
                    </button>
                </form>
            ) : createPassword === false ? (
                <form onSubmit={openApp} className="container">
                    <label htmlFor="password-app">Senha:</label>
                    <div className="password">
                        <input
                            id="password-app"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="passwordInput"
                            type={visiblePassword ? "text" : "password"}
                        />
                        {visiblePassword ? (
                            <VisibilityOffIcon
                                sx={{
                                    position: "relative",
                                    left: "-34px",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setVisiblePassword(false);
                                }}
                            />
                        ) : (
                            <VisibilityIcon
                                sx={{
                                    position: "relative",
                                    left: "-34px",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    setVisiblePassword(true);
                                }}
                            />
                        )}
                    </div>
                    <button
                        type="submit"
                        className="button buttonEnter"
                        onClick={openApp}
                    >
                        <span className="textStyle">Entrar</span>
                    </button>
                </form>
            ) : (
                <></>
            )}
        </div>
    );
};

export default Login;
