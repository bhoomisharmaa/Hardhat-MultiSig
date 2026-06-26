import { describe, it } from "node:test";
import { deepEqual, equal } from "node:assert";
import hre from "hardhat";
import artficat from "../artifacts/contracts/Wallet.sol/Wallet.json" with { type: "json" };
import { type Abi, getAddress, walletActions, zeroAddress } from "viem";

const { viem, networkHelpers } = await hre.network.create();
const abi = artficat.abi as Abi;
const abiHolder = { abi, address: zeroAddress };

describe("Wallet", function () {
  describe("constructor", function () {
    it("should revert if owners array is empty", async () => {
      await viem.assertions.revertWithCustomError(
        viem.deployContract("Wallet", [1, []]),
        abiHolder,
        "Wallet__OwnersAreRequired",
      );
    });

    it("should revert if approval threshold is zero", async () => {
      await viem.assertions.revertWithCustomError(
        viem.deployContract("Wallet", [
          0,
          ["0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"],
        ]),
        abiHolder,
        "Wallet__ApprovalThresholdMustBeGreaterThanZero",
      );
    });

    it("should revert if approval threshold exceeds number of owners", async () => {
      await viem.assertions.revertWithCustomError(
        viem.deployContract("Wallet", [
          4,
          ["0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"],
        ]),
        abiHolder,
        "Wallet__ApprovalThresholdCannotBeBiggerThanOwnerCount",
      );
    });

    it("should revert if duplicate owners are passed", async () => {
      await viem.assertions.revertWithCustomError(
        viem.deployContract("Wallet", [
          1,
          [
            "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
            "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
          ],
        ]),
        abiHolder,
        "Wallet__DuplicateOwnersNotAllowed",
      );
    });

    it("should revert if zero address is passed as owner", async () => {
      await viem.assertions.revertWithCustomError(
        viem.deployContract("Wallet", [
          1,
          [
            "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
            "0x0000000000000000000000000000000000000000",
          ],
        ]),
        abiHolder,
        "Wallet__ZeroAddressNotAllowed",
      );
    });

    it("should initialize approval threshold correctly", async () => {
      const wallet = await viem.deployContract("Wallet", [
        3,
        [
          "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
          "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
        ],
      ]);

      equal(await wallet.read.getApprovalThreshold(), 3);
    });

    it("should initialize owners array correctly", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
        owner4.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [3, owners]);

      const storedOwners = await wallet.read.getOwners();

      deepEqual(storedOwners.map(getAddress), owners.map(getAddress));
    });

    it("should set each owner status to INVITED", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
        owner4.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [3, owners]);

      for (let i = 0; i < 4; i++) {
        const ownerStatus = await wallet.read.getOwnerStatus([owners[i]]);
        equal(ownerStatus, 1);
      }
    });
  });

  describe("acceptInvitation", function () {
    it("should revert if owner is not invited", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      const connectedWallet = await viem.getContractAt(
        "Wallet",
        wallet.address,
        {
          client: { wallet: owner4 },
        },
      );

      await viem.assertions.revertWithCustomError(
        connectedWallet.write.acceptInvitation(),
        connectedWallet,
        "Wallet__OwnerNotInvited",
      );
    });

    it("should set the owner status to ACCEPTED", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();

      equal(await wallet.read.getOwnerStatus([owner1.account.address]), 2);
    });

    it("should emit event InvitationAccepted", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);

      await viem.assertions.emitWithArgs(
        await wallet.write.acceptInvitation(),
        wallet,
        "InvitationAccepted",
        [owner1.account.address],
      );
    });
  });
});
