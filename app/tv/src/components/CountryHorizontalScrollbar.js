import React from 'react';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import { useNavigate } from 'react-router-dom';
import CountryCard from './CountryCard';
import LeftArrowOfScroll from './LeftArrowOfScroll';
import RightArrowOfScroll from './RightArrowOfScroll';
import 'react-horizontal-scrolling-menu/dist/styles.css';

const CountryHorizontalScrollbar = ({countries}) => {
    const navigate = useNavigate();

    const gotoCountriesPage = () => {
        navigate('/countries')
    }

    return (
        <div style={{ paddingBottom: '2%'}} >
            <div style={{
                marginLeft: '5%',
                fontSize: '2rem',
                fontWeight: 500,
                textDecoration: 'underline',
                cursor: 'pointer',
                width: 'fit-content'
            }} onClick={gotoCountriesPage} >Countries</div>

            <ScrollMenu LeftArrow={LeftArrowOfScroll} RightArrow={RightArrowOfScroll}>
                {countries.map((eachCountry, idx) => (
                        <CountryCard key={idx} country={eachCountry} />
                    )
                )}
            </ScrollMenu>
        </div>
    )
}

export default CountryHorizontalScrollbar;

