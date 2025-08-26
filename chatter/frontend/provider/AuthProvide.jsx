import {createContext, useEffect} from "react";
import {useAuth} from "@clerk/clerk-react"
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast"

const AuthContext = createContext({})

export default function AuthProvider({children}) {

    const {getToken} = useAuth()

    useEffect(() => {
        // setup axios interceptor
        const interceptor = axiosInstance.interceptors.request.use(
            async (config) => { // это config, не response!
                try {
                    const token = await getToken()
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`
                    }
                    return config; // ОБЯЗАТЕЛЬНО возвращаем config
                } catch (err) {
                    if (err.message?.includes("auth") || err.message?.includes("token")) {
                        toast.error("Authentication failed. Please log in ")
                    }
                    console.log(err, "error getting token")
                    return config; // возвращаем config даже при ошибке
                }
            },
            (error) => {
                console.log("AXIOS request error:", error)
                return Promise.reject(error)
            }
        );

        // cleanup function
        return () => axiosInstance.interceptors.request.eject(interceptor);
    }, [getToken]);

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}