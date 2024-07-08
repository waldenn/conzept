import React from "react";
import { useNavigate } from "react-router-dom";
import {capitalizeFirstLetter} from "../helpers";

const CategoryCard = ({category}) => {
    const navigate = useNavigate();
    const handleOnClick = () => {
        navigate(`/channels?category=${category}`)
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
        backgroundColor: '#f1f1f1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}
    >
        <div style={{fontSize: 24}} >
            {capitalizeFirstLetter(category)}
        </div>
    </div>
    )
}

export default CategoryCard;