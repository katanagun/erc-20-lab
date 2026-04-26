// // SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "solady/src/tokens/ERC20.sol";

contract Solady is ERC20 {
    string internal _name;
    string internal _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function mintPublic(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnPublic(address from, uint256 amount) external {
        _burn(from, amount);
    }
}