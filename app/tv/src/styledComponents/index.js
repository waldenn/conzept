import styled from 'styled-components';

export const SearchInput = styled.input`
    width: 50vw;
    height: 50px;
    border: 1px solid lightgray;
    border-radius: 4px;
    box-shadow: 0px 0px 5px 0px lightgray;
    padding: 10px;
    font-size: 18px;
    &:focus {
        outline: none;
        box-shadow: 0px 0px 5px 2px lightgray;
    }
`;

export const ResponsiveGridlayout = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
`;