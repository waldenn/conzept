import React from "react"
import ReactCountryFlag from "react-country-flag"
import { useNavigate } from "react-router-dom"

const CountryCard = ({country}) => {
    const navigate = useNavigate();
    
    const handleOnClick = () => {
        navigate(`/channels?country=${country.code}`);
    }

    return (
    <div
    onClick={handleOnClick}
    style={{
        cursor: 'pointer',
        width: 200,
        height: 200,
        boxShadow: "0px 0px 3px 1px gray",
        margin: 10,
        borderRadius: 4,
        padding: 5,
        backgroundColor: '#f1f1f1'
    }}
    >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} >
            <div style={{flex: 2}} >
                <ReactCountryFlag style={{width: 160, height: 160}} countryCode={country.code} svg />
            </div>
            <div style={{flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'}} >
                {country.name}
            </div>
        </div>
    </div>
    )
}

export default CountryCard;