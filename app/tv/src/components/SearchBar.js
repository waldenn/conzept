import React from "react";
import { SearchInput } from "../styledComponents";

const SearchBar = ({value, onChangeCallback}) => {
    const onTextChange = (e) => {
        e.preventDefault();
        onChangeCallback(e.target.value);
    }
    
    return (
        <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} >
            <SearchInput type="text" value={value} placeholder="Search" onChange={onTextChange} />
        </div>
    )
}

export default SearchBar;