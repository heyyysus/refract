import React from 'react';
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage(){
    
    const { loginWithRedirect } = useAuth0();

    return <div>
        <h1>Welcome to Refract</h1>
        <button onClick={() => loginWithRedirect()}>Log In</button>
    </div>;
}