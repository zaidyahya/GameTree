import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export default ({ children }) => {
    const [ user, setUser ] = useState(null)
    const [ isAuthenticated, setisAuthenticated ] = useState(false)

    useEffect(() => {
        //console.log("AUTHENTICATION EFFECT - AuthContext")
        AuthService.isAuthenticated().then(data => {
            setUser(data.user);
            setisAuthenticated(data.isAuthenticated)
        })
    }, [])

    return(
        <div>
            <AuthContext.Provider value={{user, setUser, isAuthenticated, setisAuthenticated}}>
                { children }
            </AuthContext.Provider>
        </div>
    )
}