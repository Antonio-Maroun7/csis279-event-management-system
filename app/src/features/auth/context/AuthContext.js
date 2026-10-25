import { createContext } from "react";

// holds { user, loading, login, register, logout, updateUser }
const AuthContext = createContext(null);

export default AuthContext;
