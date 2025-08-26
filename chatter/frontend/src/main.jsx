import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {ClerkProvider} from "@clerk/clerk-react";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"

const queryClient = new QueryClient()
import {BrowserRouter} from "react-router"
import {Toaster} from "react-hot-toast";
import AuthProvide from "../provider/AuthProvide.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <AuthProvide>
                        <App/>
                    </AuthProvide>
                    <Toaster/>
                </QueryClientProvider>

            </BrowserRouter>
        </ClerkProvider>
    </StrictMode>,
)
