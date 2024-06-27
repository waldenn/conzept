import React from "react";
import useAppWide from "../providers/appWide/hook";
import Wrapper from "../components/Wrapper";
import CountryCard from "../components/CountryCard";

const Country = () => {
    const {state: {countries}} = useAppWide();
    return (
    <Wrapper>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',
            }} >
            {
                countries.map((eachCountry, idx) => <CountryCard key={idx} country={eachCountry}  />)
            }
        </div>
    </Wrapper>
    )
}

export default Country;