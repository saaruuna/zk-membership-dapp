// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Event.sol"; // Import Event.sol from the local directory

contract Membership {
    struct Member {
        address addr;
        uint256 publicKey;
    }

    Member[] public members;

    event MemberAdded(address indexed memberAddress, uint256 publicKey);
    event MemberRemoved(address indexed memberAddress, uint256 publicKey);

    function getMembers() external view returns (Member[] memory) {
        return members;
    }

    function getMembershipCount() external view returns (uint256) {
        return members.length;
    }

    function addMember(uint256 _publicKey) external payable {
        // Require a specific amount to be sent along with member information
        require(msg.value >= 1 ether, "Insufficient funds");

        // Add the new member
        members.push(Member(msg.sender, _publicKey));

        // Emit an event indicating the new member
        emit MemberAdded(msg.sender, _publicKey);

        // Deploy a new Event contract
        Event newEvent = new Event();
        address newEventAddress = address(newEvent);
    }

    function removeMember(address _memberAddress) external {
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i].addr == _memberAddress) {
                // Remove the member and shift the array
                members[i] = members[members.length - 1];
                members.pop();

                // Emit an event indicating the removal of the member
                emit MemberRemoved(_memberAddress, members[i].publicKey);
                return;
            }
        }

        revert("Member not found");
    }
}
