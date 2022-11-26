import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import CryptoES from "crypto-es";
import { useEffect, useState } from "react";
import { Box, Button, Modal, TextField } from "@mui/material";
const KEY = process.env.REACT_APP_KEY;
const IP = process.env.REACT_APP_IP;

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

const Passwords = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [itemId, setItemId] = useState("");
    const [typeItemId, setTypeItemId] = useState("");
    const [type, setType] = useState("");
    const [newUser, setNewUser] = useState({
        name: "",
        login: "",
        password: "",
        lastModified: "",
    });
    const [savedUsers, setSavedUsers] = useState([]);

    const handleOpen = () => setModalVisible(true);
    const handleClose = () => setModalVisible(false);

    const encrypt = (data) => {
        const encrypted = CryptoES.AES.encrypt(data, KEY).toString();
        return encrypted;
    };

    const decrypt = (dataToDecrypt) => {
        const passDecripted = CryptoES.AES.decrypt(dataToDecrypt, KEY);
        return passDecripted.toString(CryptoES.enc.Utf8);
    };

    const decryptResponse = (response) => {
        let decryptedItem = response;
        decryptedItem.forEach((account) => {
            return (account.password = decrypt(account.password));
        });
        setSavedUsers(decryptedItem);
        return decryptedItem;
    };

    const addAccountOnDatabase = async (method, body) => {
        try {
            const request = await fetch(`http://${IP}:5000/add-account`, {
                method: method,
                mode: "cors",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify(body),
            });
            const response = await request.json();
            return response;
        } catch (e) {
            console.error(e, "Erro ao enviar os dados para o banco");
            setModalVisible(false);
        }
    };

    const addAccount = async () => {
        let conta = newUser;
        let method;
        if (type === "update") {
            method = "PUT";
        } else {
            method = "POST";
        }
        conta.password = encrypt(conta.password);
        let body = { account: conta };
        if (method === "PUT" && itemId) {
            body.account.id = itemId;
        }
        setModalVisible(false);
        const allAccounts = await addAccountOnDatabase(method, body);
        setSavedUsers(decryptResponse(allAccounts));
    };

    const updateData = (account, index) => {
        let id = account?.id ? account?.id : index;
        let typeItemId = account?.id ? "back" : "front";
        setTypeItemId(typeItemId);
        let filteredInfos;
        if (account?.id) {
            filteredInfos = savedUsers.filter((account) => {
                return account.id === id;
            })[0];
        } else {
            filteredInfos = savedUsers[index];
        }
        setNewUser({
            name: filteredInfos.name,
            login: filteredInfos.login,
            password: filteredInfos.password,
        });
        setItemId(id);
        setModalVisible(true);
    };

    const deleteInfo = async (account, index) => {
        try {
            fetch(`http://${IP}:5000/account`, {
                method: "DELETE",
                mode: "cors",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify({ id: account.id }),
            })
                .then((res) => res.json())
                .then(
                    async (result) => {
                        setSavedUsers(decryptResponse(result));
                    },
                    (error) => {
                        console.error(error);
                    }
                );
        } catch (e) {
            console.error(e);
        }
    };

    const getAccounts = async () => {
        const request = await fetch(`http://${IP}:5000/accounts`, {
            method: "GET",
            mode: "cors",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            },
        });
        const users = await request.json();
        setSavedUsers(decryptResponse(users));
    };

    useEffect(() => {
        getAccounts();
    }, []);

    return (
        <div className="centeredView">
            <Modal
                open={modalVisible}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className="centeredView">
                        <div className="modalView">
                            <TextField
                                label="Nome"
                                variant="standard"
                                value={newUser.name}
                                className="input"
                                onChange={(e) => {
                                    setNewUser((prevState) => ({
                                        ...prevState,
                                        name: e.target.value,
                                    }));
                                }}
                            />
                            <TextField
                                label="Login"
                                variant="standard"
                                value={newUser.login}
                                onChange={(e) => {
                                    setNewUser((prevState) => ({
                                        ...prevState,
                                        login: e.target.value,
                                    }));
                                }}
                            />
                            <TextField
                                label="Senha"
                                variant="standard"
                                value={newUser.password}
                                onChange={(e) => {
                                    setNewUser((prevState) => ({
                                        ...prevState,
                                        password: e.target.value,
                                    }));
                                }}
                            />
                            <div className="options">
                                <Button
                                    disabled={
                                        !newUser.login?.length ||
                                        !newUser.password?.length ||
                                        !newUser.name?.length
                                    }
                                    color="success"
                                    onClick={() => addAccount()}
                                    variant="contained"
                                >
                                    Salvar
                                </Button>
                                <Button
                                    color="error"
                                    onClick={() =>
                                        setModalVisible(!modalVisible)
                                    }
                                    variant="contained"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
            {savedUsers?.length ? (
                <>
                    <p className="title">Suas Senhas:</p>
                    <div className="credentialCards">
                        {savedUsers.map((account, index) => {
                            return (
                                <div key={index} className="card">
                                    <p className="cardTitle">{account.name}</p>
                                    <p className="cardInfo">
                                        {`Usuário: ${account.login}`}
                                    </p>
                                    <p className="cardInfo">
                                        {`Senha: ${account.password}`}
                                    </p>
                                    <div className="buttonGroup">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard
                                                    .writeText(account.login)
                                                    .then(() => {
                                                        alert(
                                                            "Usuário copiado"
                                                        );
                                                    })
                                                    .catch(() => {
                                                        alert(
                                                            "Ocorreu um erro ao copiar o usuário"
                                                        );
                                                    });
                                            }}
                                            className="button buttonCopy"
                                        >
                                            <span className="textStyle">
                                                Copiar usuário
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                navigator.clipboard
                                                    .writeText(account.password)
                                                    .then(() => {
                                                        alert("Senha copiada");
                                                    })
                                                    .catch(() => {
                                                        alert(
                                                            "Ocorreu um erro ao copiar o usuário"
                                                        );
                                                    });
                                            }}
                                            className="button buttonCopy"
                                        >
                                            <span className="textStyle">
                                                Copiar senha
                                            </span>
                                        </button>
                                    </div>
                                    <div className="action-icons">
                                        <DeleteIcon
                                            className="icon"
                                            fontSize="large"
                                            color="error"
                                            onClick={() =>
                                                deleteInfo(account, index)
                                            }
                                        />
                                        <EditIcon
                                            className="icon"
                                            fontSize="large"
                                            color="action"
                                            onClick={() => {
                                                setType("update");
                                                updateData(account, index);
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div>
                    <p className="title">Você não tem senhas salvas</p>
                </div>
            )}
            <AddCircleIcon
                sx={{ fontSize: "60px", cursor: "pointer" }}
                onClick={() => {
                    setNewUser({ name: "", login: "", password: "" });
                    setType("add");
                    setModalVisible(true);
                }}
                color="success"
            />
        </div>
    );
};

export default Passwords;
