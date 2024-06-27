import React from "react";
import useAppWide from "../providers/appWide/hook";
import Wrapper from "../components/Wrapper";
import CategoryCard from "../components/CategoryCard";

const Category = () => {
    const {state: {categories}} = useAppWide();
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
                categories.map((eachCategory, idx) => <CategoryCard key={idx} category={eachCategory}  />)
            }
        </div>
    </Wrapper>
    )
}

export default Category;