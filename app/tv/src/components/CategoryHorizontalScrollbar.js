import React from 'react';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import { useNavigate } from 'react-router-dom';
import CountryCard from './CategoryCard';
import LeftArrowOfScroll from './LeftArrowOfScroll';
import RightArrowOfScroll from './RightArrowOfScroll';
import 'react-horizontal-scrolling-menu/dist/styles.css';

const CategoryHorizontalScrollbar = ({categories}) => {
    const navigate = useNavigate();

    const gotoCategoriesPage = () => {
        navigate('/categories')
    }

    return (
        <div style={{paddingTop: '2%'}} >
            <div style={{
                marginLeft: '5%',
                fontSize: '2rem',
                fontWeight: 500,
                textDecoration: 'underline',
                cursor: 'pointer',
                width: 'fit-content'
            }} onClick={gotoCategoriesPage} >Categories</div>

            <ScrollMenu LeftArrow={LeftArrowOfScroll} RightArrow={RightArrowOfScroll}>
                {categories.map((eachCategory, idx) => (
                        <CountryCard key={idx} category={eachCategory} />
                    )
                )}
            </ScrollMenu>
        </div>
    )
}

export default CategoryHorizontalScrollbar;

