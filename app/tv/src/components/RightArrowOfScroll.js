import React from "react";
import { VisibilityContext } from 'react-horizontal-scrolling-menu';
import { MdOutlineKeyboardArrowRight } from "react-icons/md";

const RightArrowOfScroll = () => {
    const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext);
    return (
        <div style={{
            cursor: 'pointer',
            margin: 10,
            width: 50,
            fontSize: '3rem',
            backgroundColor: "#f9f6f6",
            boxShadow: '#f9f6f6 0px 0px 6px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }} 
        disabled={isLastItemVisible}
        onClick={() => scrollNext()}
        >
            <MdOutlineKeyboardArrowRight />
        </div>
    )
}

export default RightArrowOfScroll;