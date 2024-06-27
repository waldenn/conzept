import React from "react";
import AppBar from "./AppBar";

const Wrapper = ({children}) => {
    return (
        <div style={{backgroundColor: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column'}} >
            <AppBar />
            <div style={{flexGrow: 1, marginTop: 50}}>
            {children}
            </div>  
        </div>
    )
}

export default Wrapper;