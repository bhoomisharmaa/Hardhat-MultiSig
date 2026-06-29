import { describe, it } from "node:test";
import { deepEqual, equal } from "node:assert";
import hre from "hardhat";
import artficat from "../artifacts/contracts/Wallet.sol/Wallet.json" with { type: "json" };
import { type Abi, getAddress, zeroAddress } from "viem";

const { viem } = await hre.network.create();
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
      const [owner1, owner2, owner3] = await viem.getWalletClients();
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
      const [owner1, owner2, owner3] = await viem.getWalletClients();
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

  describe("declineInvitation", function () {
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
        connectedWallet.write.declineInvitation(),
        connectedWallet,
        "Wallet__OwnerNotInvited",
      );
    });

    it("should set the owner status to DECLINED", async () => {
      const [owner1, owner2, owner3] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.declineInvitation();

      equal(await wallet.read.getOwnerStatus([owner1.account.address]), 3);
    });

    it("should emit event InvitationDeclined", async () => {
      const [owner1, owner2, owner3] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);

      await viem.assertions.emitWithArgs(
        await wallet.write.declineInvitation(),
        wallet,
        "InvitationDeclined",
        [owner1.account.address],
      );
    });
  });

  describe("createTransaction", function () {
    it("should revert if caller is not a accepted owner", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);

      await viem.assertions.revertWithCustomError(
        wallet.write.createTransaction([40n, owner4.account.address]),
        wallet,
        "Wallet__NotTheOwner",
      );
    });

    it("should revert if zero address is passed as recipient", async () => {
      const [owner1, owner2, owner3] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();

      await viem.assertions.revertWithCustomError(
        wallet.write.createTransaction([
          40n,
          "0x0000000000000000000000000000000000000000",
        ]),
        wallet,
        "Wallet__ZeroAddressNotAllowed",
      );
    });

    it("should revert if zero is passed as amount", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();

      await viem.assertions.revertWithCustomError(
        wallet.write.createTransaction([0n, owner4.account.address]),
        wallet,
        "Wallet__AmountShouldBeGreaterThanZero",
      );
    });

    it("should correctly initialize the transaction fields", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();

      await wallet.write.createTransaction([40n, owner4.account.address]);
      const transaction = await wallet.read.getTransaction([0n]);

      deepEqual(
        [
          getAddress(transaction[0]),
          getAddress(transaction[1]),
          transaction[2],
          transaction[3],
          transaction[4],
          transaction[5].map(getAddress),
          transaction[6],
        ],
        [
          getAddress(owner1.account.address),
          getAddress(owner4.account.address),
          40n,
          0n,
          1,
          [getAddress(owner1.account.address)],
          0,
        ],
      );
    });

    it("should increment transactionCount", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();

      const transactionCount1 = await wallet.read.getTransactionCount();

      await wallet.write.createTransaction([40n, owner4.account.address]);

      const transactionCount2 = await wallet.read.getTransactionCount();

      equal(transactionCount1 + 1n, transactionCount2);
    });

    it("should emit event TransactionCreated", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();

      await viem.assertions.emitWithArgs(
        await wallet.write.createTransaction([40n, owner4.account.address]),
        wallet,
        "TransactionCreated",
        [owner1.account.address, owner4.account.address, 40n, 0n],
      );
    });
  });

  describe("approveTransaction", function () {
    it("should revert if caller is not a accepted owner", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      const connectedWallet = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner3 } },
      );

      await viem.assertions.revertWithCustomError(
        connectedWallet.write.approveTransaction([0n]),
        wallet,
        "Wallet__NotTheOwner",
      );
    });

    it("should revert if transactionIndex is greater than transactionCount", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      await viem.assertions.revertWithCustomError(
        wallet.write.approveTransaction([4n]),
        wallet,
        "Wallet__InvalidTransactionIndex",
      );
    });

    it("should revert if the transaction is already executed", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);

      await owner1.sendTransaction({
        to: wallet.address,
        value: 50n,
      });

      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      const connectedWallet2 = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner2 } },
      );

      await connectedWallet2.write.acceptInvitation();
      await connectedWallet2.write.approveTransaction([0n]);

      const connectedWallet3 = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner3 } },
      );

      await connectedWallet3.write.acceptInvitation();

      await viem.assertions.revertWithCustomError(
        connectedWallet3.write.approveTransaction([0n]),
        wallet,
        "Wallet__TransactionAlreadyExecuted",
      );
    });

    it("reverts when caller has already approved", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);

      await owner1.sendTransaction({
        to: wallet.address,
        value: 50n,
      });

      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      await viem.assertions.revertWithCustomError(
        wallet.write.approveTransaction([0n]),
        wallet,
        "Wallet__OwnerHasAlreadyApproved",
      );
    });

    it("should increment transaction approval by one", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [3, owners]);

      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      const connectedWallet2 = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner2 } },
      );
      const txn1 = await wallet.read.getTransaction([0n]);

      await connectedWallet2.write.acceptInvitation();
      await connectedWallet2.write.approveTransaction([0n]);

      const txn2 = await wallet.read.getTransaction([0n]);

      equal(txn1[4] + 1, txn2[4]);
    });

    it("should add the owner to the approval array", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];
      const ownerWhoWillApprove = [owners[0], owners[1]];

      const wallet = await viem.deployContract("Wallet", [3, owners]);

      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      const connectedWallet2 = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner2 } },
      );

      await connectedWallet2.write.acceptInvitation();
      await connectedWallet2.write.approveTransaction([0n]);

      const txn = await wallet.read.getTransaction([0n]);

      deepEqual(txn[5].map(getAddress), ownerWhoWillApprove.map(getAddress));
    });

    it("should execute the transaction when number of approvals reaches threshold", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);
      const publicClient = await viem.getPublicClient();
      await publicClient.getBalance({ address: wallet.address });

      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      await owner1.sendTransaction({ to: wallet.address, value: 100n });

      const connectedWallet2 = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner2 } },
      );

      await connectedWallet2.write.acceptInvitation();
      await connectedWallet2.write.approveTransaction([0n]);

      const txn = await wallet.read.getTransaction([0n]);
      const balance = await publicClient.getBalance({
        address: wallet.address,
      });

      equal(txn[6], 1);
      equal(balance, 60n);
    });

    it("should emit event TransactionExecuted on execution", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [2, owners]);

      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      const connectedWallet2 = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner2 } },
      );

      await connectedWallet2.write.acceptInvitation();
      await owner1.sendTransaction({
        to: wallet.address,
        value: 50n,
      });

      await viem.assertions.emitWithArgs(
        await connectedWallet2.write.approveTransaction([0n]),
        wallet,
        "TransactionExecuted",
        [0n],
      );
    });

    it("should emit event TransactionExecuted on execution", async () => {
      const [owner1, owner2, owner3, owner4] = await viem.getWalletClients();
      const owners = [
        owner1.account.address,
        owner2.account.address,
        owner3.account.address,
      ];

      const wallet = await viem.deployContract("Wallet", [3, owners]);

      await wallet.write.acceptInvitation();
      await wallet.write.createTransaction([40n, owner4.account.address]);

      const connectedWallet2 = await viem.getContractAt(
        "Wallet",
        wallet.address,
        { client: { wallet: owner2 } },
      );

      await connectedWallet2.write.acceptInvitation();

      await viem.assertions.emitWithArgs(
        await connectedWallet2.write.approveTransaction([0n]),
        wallet,
        "TransactionApproved",
        [owner2.account.address, 0n],
      );
    });
  });
});
