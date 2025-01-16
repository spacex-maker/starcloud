import React from "react";
import styled from "styled-components";
import tw from "twin.macro";

const SearchContainer = styled.div`
  ${tw`w-full max-w-xl relative`}
`;

const SearchBox = styled.div`
  ${tw`relative flex items-center w-full`}
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover, &:focus-within {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SearchIcon = styled.i`
  ${tw`absolute text-gray-400`}
  left: 1rem;
  font-size: 1.1rem;
`;

const Input = styled.input`
  ${tw`w-full py-3 text-white bg-transparent outline-none`}
  padding-left: 3rem;
  padding-right: 3rem;
  font-size: 1rem;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ClearButton = styled.button`
  ${tw`absolute text-gray-400 hover:text-white transition-colors duration-200`}
  right: 1rem;
  font-size: 1.1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <SearchContainer>
      <SearchBox>
        <SearchIcon className="bi bi-search" />
        <Input
          type="text"
          placeholder="搜索网站、服务或应用..."
          value={value}
          onChange={onChange}
        />
        {value && (
          <ClearButton onClick={onClear}>
            <i className="bi bi-x-lg"></i>
          </ClearButton>
        )}
      </SearchBox>
    </SearchContainer>
  );
};

export default SearchBar; 