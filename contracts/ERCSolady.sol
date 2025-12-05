// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "solady/src/tokens/ERC20.sol";

contract Solady is ERC20{
    string public _name;
    string public _symbol;

    constructor(){
        _name = "MyToken";
        _symbol = "MT";
    }

      function mintPublic(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnPublic(address from, uint256 amount) external {
        _burn(from, amount);
    }

    function name() public view override returns (string memory){
        return _name;
    }

    function symbol() public view override returns (string memory){
        return _symbol;
    }
}
