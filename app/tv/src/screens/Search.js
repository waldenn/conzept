import React, {useState, useEffect} from "react";
import useAppWide from "../providers/appWide/hook";
import Wrapper from "../components/Wrapper";
import SearchBar from "../components/SearchBar";
import CountryCard from "../components/CountryCard";
import ChannelCard from "../components/ChannelCard";
import CategoryCard from "../components/CategoryCard";
import { ResponsiveGridlayout } from "../styledComponents";

const Search = () => {
    const {state: {countries, channels, categories}} = useAppWide();
    const [searchText, setSearchText] = useState('');
    const [filteredViews, setFilteredViews] = useState([]);
    
    const searchTextChangeHandler = (text) => {
        setFilteredViews([]);
        setSearchText(text);
    }

    const beginSearch = () => {
        const countryViews = searchCountries();
        const channelViews = searchChannels();
        const categoryViews = searchCategories();
        setFilteredViews([...categoryViews, ...countryViews, ...channelViews])
    }

    const searchCountries = () => {
        const foundCountries = countries.filter(
            (eachCountry) => eachCountry.name?.toLowerCase().includes(searchText.trim().toLowerCase())
        );
        
        return [...filteredViews, ...foundCountries.map((eachCountry) => <CountryCard key={eachCountry.name + eachCountry.id} country={eachCountry} />)];
    };

    const searchChannels = () => {
        const foundChannels = channels.filter(
            (eachChannel) => eachChannel.name?.toLowerCase().includes(searchText.trim().toLowerCase())
        );
        
        return [...filteredViews, ...foundChannels.map((eachChannel) => <ChannelCard key={eachChannel.name + eachChannel.id} channel={eachChannel} />)];
    };

    const searchCategories = () => {
        const foundCategories = categories.filter(
            (eachCategory) => eachCategory?.toLowerCase().includes(searchText.trim().toLowerCase())
        );

        return [...filteredViews, ...foundCategories.map((eachCategory) => <CategoryCard key={eachCategory} category={eachCategory} />)];
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            if(searchText.length > 2) {
                beginSearch();
            }
        }, 500);
        return () => { clearTimeout(timeout) }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [searchText])

    return (
    <Wrapper>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',
            }} >
           <div>
                <SearchBar value={searchText} onChangeCallback={searchTextChangeHandler} />
           </div>
           <ResponsiveGridlayout style={{marginTop: 20}} >
                {filteredViews}
           </ResponsiveGridlayout>
        </div>
    </Wrapper>
    )
}

export default Search;