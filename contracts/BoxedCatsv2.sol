// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

// POG Token
contract CatPoopCoins is ERC20, ERC20Burnable, Ownable {
    constructor(
        address manager
    ) ERC20("Cat Poop Token", "CPOOP") Ownable(manager) {}
    function excrete(address destination, uint256 amount) public onlyOwner {
        _mint(destination, amount);
    }
}

contract BoxedCatsv2 is ERC721Burnable, Ownable {
    mapping(address => uint256) public refCount;
    mapping(address => mapping(uint256 => address)) public referrals;
    mapping(uint256 => uint256) tokenIdMintTime; // monitor when the token is minted
    mapping(uint256 => uint256) claimedTokens;
    uint256 tokenGenerationRate = 277777777777777; // 24 tokens per day
    uint256 tokenId = 482; // starting ID after the migration drop
    uint256 tokenPrice = 1 ether;
    string metadataUri =
        "ipfs://QmNeP59iZkiRpLfiVrguMbrfCdgb8H9Z9XkpdYuSiPq9NK/1.json";

    CatPoopCoins poopsie;

    constructor()
        ERC721("Boxed Cats of Society v2", "BCOSv2")
        Ownable(msg.sender)
    {
        poopsie = new CatPoopCoins(address(this));
    }

    function totalGenerated(uint256 _tokenId) public view returns (uint256) {
        uint256 multiplier = getPoints(ownerOf(_tokenId), 1);
        console.log("multiplier", multiplier);

        return
            (block.timestamp - tokenIdMintTime[_tokenId]) *
            tokenGenerationRate *
            multiplier;
    }

    function totalClaimed(uint256 _tokenId) public view returns (uint256) {
        return claimedTokens[_tokenId];
    }

    function claimPoop(uint256 _tokenId) public {
        uint256 _amount = claimablePoop(_tokenId);
        poopsie.excrete(msg.sender, _amount);
        claimedTokens[_tokenId] += _amount;
    }

    function claimablePoop(uint256 _tokenId) public view returns (uint256) {
        return totalGenerated(_tokenId) - totalClaimed(_tokenId);
    }

    function poopCount(address eoa) public view returns (uint256) {
        return poopsie.balanceOf(eoa);
    }

    function setPrice(uint256 _price) public onlyOwner {
        tokenPrice = _price;
    }

    function mintPaid(address destination) public payable {
        require(msg.value >= tokenPrice, "Not enough payment");
        __mint(destination, tokenId);
        tokenId++;
    }

    function mintOwner(address destination) public onlyOwner {
        __mint(destination, tokenId);
        tokenId++;
    }

    function migrationDrop(
        address destination,
        uint256 _tokenId
    ) public onlyOwner {
        __mint(destination, _tokenId);
    }

    function migrationDropBatch(
        address destination,
        uint256[] memory _tokenIds
    ) public onlyOwner {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            migrationDrop(destination, _tokenIds[i]);
        }
    }

    // Enables proxy for awarding friend
    function proxyAwardFriend(
        address inbehalfof,
        address friend
    ) public onlyOwner {
        _awardedMinting(inbehalfof, friend);
    }

    function awardFriend(address friend) public {
        _awardedMinting(msg.sender, friend);
    }

    function _awardedMinting(address sender, address receiver) internal {
        require(balanceOf(sender) > 0, "Caller must own this NFT");
        require(
            balanceOf(receiver) == 0,
            "Receiver address should not own this NFT"
        );

        require(
            refCount[sender] < getMaxAllowedAwards(sender),
            "You can only award maximum of NFTs equal to your owned NFTs + 10"
        );

        __mint(receiver, tokenId);
        tokenId++;

        referrals[sender][refCount[msg.sender]] = receiver;
        refCount[sender]++;
    }

    function getMaxAllowedAwards(address eoa) public view returns (uint256) {
        if (balanceOf(eoa) >= 10) {
            return 20;
        }
        return 10 + balanceOf(eoa);
    }

    function __mint(address destination, uint256 __tokenId) internal {
        _safeMint(destination, __tokenId);
        tokenIdMintTime[__tokenId] = block.timestamp;
        //  _setTokenURI(newItemId, tokenURI);
    }

    function getPoints(
        address node,
        uint256 level
    ) public view returns (uint256) {
        uint256 _i = 0;
        uint256 score = 1 * level;
        address parent = node;
        address curNode = referrals[parent][_i];

        while (curNode != address(0)) {
            curNode = referrals[parent][_i];
            if (curNode != address(0)) {
                score += getPoints(curNode, level + 1);
            }
            _i++;
        }
        return score;
    }

    // owners can mint for any unique wallet without BCOS yet
    // owners can only have N amount of referrals per sleep time (ex. 1 per day)
    // owners minted are rewarded a bound ERC20 (Proof of OG - time based tokens)
    // NFT is liquid-staked to claim this token POG-TOKENS
    // points ( address ) - get
    // level curve ( exponential )
    // token unlocked = level curve * referrals = tokens unlocked is a function of referrals and levels,
    // the more referrals coming from your

    // optional: can buy NFT, set price
    // BCOS specific
    // migrationDrop ( address, token ) onlyOwner
}
