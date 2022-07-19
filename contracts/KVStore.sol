//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract KVStoreInt {
    mapping(uint32 => uint32) private store;

    function set(uint32 k, uint32 v) public returns (uint32) {
        uint32 old = store[k];
        store[k] = v;
        return old;
    }

    function setAndInc(uint32 k) public returns (uint32) {
        uint32 inc = store[k] + 1;
        store[k] = inc;
        return inc;
    }

    function get(uint32 k) public view returns (uint32) {
        return store[k];
    }
}
