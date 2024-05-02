import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Boxed Cats V2", function () {
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const signers = await hre.ethers.getSigners();
    const [owner, acct2, acct3, acct4, acct5, acct6] = signers;

    const Lock = await hre.ethers.getContractFactory("BoxedCatsv2");
    const contract = await Lock.deploy();

    console.log('accounts', {
      owner: owner.address,
      acct2: acct2.address,
      acct3: acct3.address,
      acct4: acct4.address,
      acct5: acct5.address,
      acct6: acct6.address,
    })

    return { contract, signers, users: { owner, acct2, acct3, acct4, acct5, acct6 } };
  }

  describe("NFT", function () {
    it("should be able to perform migration airdrop", async () => {
      const { contract, users: { owner, acct2 } } = await loadFixture(deploy);
      await contract.migrationDrop(acct2.address, 1);
      await contract.migrationDrop(acct2.address, 2);
      expect(await contract.ownerOf(1)).to.be.eq(acct2.address);
      expect(await contract.ownerOf(2)).to.be.eq(acct2.address);
    });

    it("should be able to do regular paid mint", async () => {
      const { contract, users: { owner, acct2 } } = await loadFixture(deploy);
      await contract.connect(acct2).mintPaid(acct2.address, { value: hre.ethers.parseUnits("1") });
      expect(await contract.balanceOf(acct2.address)).to.be.eq(1);
    });

    it("owner should be able to free mint", async () => {
      const { contract, users: { owner, acct2 } } = await loadFixture(deploy);
      await contract.mintOwner(acct2.address);

      expect(await contract.balanceOf(acct2.address)).to.be.eq(1);
    });

    it("should be able to mint for friend", async () => {
      const { contract, users: { owner, acct2, acct3, acct4, acct5, acct6 } } = await loadFixture(deploy);
      await contract.migrationDrop(acct2.address, 123);

      await contract.connect(acct2).awardFriend(acct3.address);
      await contract.connect(acct3).awardFriend(acct4.address);
      await contract.connect(acct4).awardFriend(acct5.address);
      await contract.connect(acct5).awardFriend(acct6.address);

      expect(await contract.getPoints(acct2.address, 1)).to.be.eq(15);
    })

    // it should not exceed maximum amount of awarded nfts
    // withdrawable both eth and erc20 tokens
    // withdrawable erc721
  });

  describe("ERC20", function () {
    it("should be able to claim", async () => {
      const { contract, users: { owner, acct2, acct3, acct4 } } = await loadFixture(deploy);
      await contract.migrationDrop(acct2.address, 1);
      await contract.migrationDrop(acct2.address, 2);

      // next line increases multiplier
      await contract.connect(acct2).awardFriend(acct3.address);
      await contract.connect(acct2).awardFriend(acct4.address);

      const forwardTime = (await time.latest()) + 60 * 60 * 24 // 1 day;
      await time.increaseTo(forwardTime);

      let claimable = await contract.claimablePoop(1);

      console.log(`claimable ${hre.ethers.formatEther(claimable)} $CPOOP`)

      // claiming for token 1
      await contract.connect(acct2).claimPoop(1);

      console.log(await contract.poopCount(acct3.address));

      await time.increaseTo(await time.latest() + 60 * 60);

      claimable = await contract.claimablePoop(1);
      console.log(`claimable ${hre.ethers.formatEther(claimable)} $CPOOP`)
    })
  })
})