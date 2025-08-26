import React from 'react'
import {SignedIn, SignedOut, SignInButton,} from "@clerk/clerk-react";
import {Navigate, Route, Routes} from "react-router";
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import toast from "react-hot-toast";
import {useAuth} from "@clerk/clerk-react"

import CallPage from "./pages/CallPage.jsx";

const App = () => {

    const {isSignedIn, isLoaded} = useAuth()
    return isLoaded && (
        <Routes>
            <Route path="/" element={isSignedIn ? <HomePage/> : <Navigate to={"/auth"} replace/>}/>
            <Route path="/auth" element={!isSignedIn ? <AuthPage/> : <Navigate to={"/"} replace/>}/>

            //add call page
            <Route path="/call/:id" element={isSignedIn ? <CallPage/> : <Navigate to={"/auth"} replace/>}/>

            <Route path="*" element={isSignedIn ? <Navigate to={"/"} replace/> : <Navigate to={"/auth"} replace/>}/>

        </Routes>
    )
}
export default App

