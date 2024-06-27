import React from "react";
import Wrapper from "../components/Wrapper";
import CountryHorizontalScrollbar from "../components/CountryHorizontalScrollbar";
import CategoryHorizontalScrollbar from "../components/CategoryHorizontalScrollbar";
import useAppWide from "../providers/appWide/hook";

const Home = () => {
    const {state: {countries, categories}} = useAppWide();

    return (
    <Wrapper>
        <div style={{backgroundColor: '', height: 'inherit'}}>
            <CountryHorizontalScrollbar countries={countries} />
            <CategoryHorizontalScrollbar categories={categories} />
        </div>
    </Wrapper>
    )
}

export default Home;