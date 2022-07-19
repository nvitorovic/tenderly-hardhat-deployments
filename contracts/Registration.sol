//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./KVStore.sol";

contract Registration {
    KVStoreInt private kvStore;
    event Registratered(address attendee, uint8 date);

    function register(uint8 date, address attendee) public {
        kvStore.setAndInc(date);
        emit Registratered(attendee, date);
    }
}
