import React from "react"
import { Link } from "react-router-dom";
import {FaSearch} from 'react-icons/fa';

const AppBar = () => {

    return (
        <nav style={{
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            width: '100%',
            backgroundColor: '#fff'
        }}>
            <Link to={'/'} style={{textDecoration: 'none', color: '#000', marginLeft: 50}} >
                <p style={{fontFamily: 'Caveat', fontSize: 18}}>
                    Public domain IPTV
                </p>
            </Link>
            <ul style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 50}} >
                <li style={{listStyle: 'none'}}>
                    <Link to={'/search'} style={{textDecoration: 'none', color: '#000', fontSize: 16}} ><FaSearch style={{marginRight: '5px', fontSize: 10}} />Search</Link>
                </li>
            </ul>
        </nav>
    )
}

export default AppBar