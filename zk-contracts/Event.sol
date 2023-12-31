pragma solidity 0.5.11;

import "zk-circuits/build/Verifier.sol";

contract Event is Verifier {
    address public owner;
    uint256[2][] public publicKeys;

    constructor() public {
        owner = msg.sender;
        publicKeys.push([11588997684490517626294634429607198421449322964619894214090255452938985192043, 15263799208273363060537485776371352256460743310329028590780329826273136298011]);
        publicKeys.push([3554016859368109379302439886604355056694273932204896584100714954675075151666, 17802713187051641282792755605644920157679664448965917618898436110214540390950]);
    }

    function addToGroup(uint256[2] memory newKey) public {
        require(msg.sender == owner, "Only the owner can add new keys");
        publicKeys.push(newKey);
    }

    function isInGroup(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input // public inputs
    ) public view returns (bool) {
        for (uint256 i = 0; i < publicKeys.length; i++) {
            if (input[2 * i] == publicKeys[i][0] && input[2 * i + 1] == publicKeys[i][1]) {
                return verifyProof(a, b, c, input);
            }
        }
        revert("Supplied public keys do not match contracts");
    }
}
