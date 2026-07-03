// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/math/Math.sol";

contract Wallet {
    // enums
    enum OwnerStatus {
        INVALID,
        INVITED,
        ACCEPTED,
        DECLINED
    }

    enum TransactionStatus {
        PENDING,
        EXECUTED,
        DECLINED
    }

    // structs
    struct Transaction {
        address creator;
        address recipient;
        uint256 amount;
        uint256 index;
        uint32 approvals;
        mapping(address => bool) ownerToHasApproved;
        TransactionStatus status;
    }

    // Events
    event InvitationAccepted(address indexed owner);
    event InvitationDeclined(address indexed owner);
    event TransactionCreated(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 transactionIndex
    );
    event TransactionApproved(address indexed owner, uint256 transactionIndex);
    event TransactionDisapproved(
        address indexed owner,
        uint256 transactionIndex
    );
    event TransactionExecuted(uint256 transactionIndex);
    event OwnerInvited(address indexed owner);
    event OwnerLeftTheWallet(address indexed owner);
    event InvitedOwnerRemovedFromWallet(address indexed owner);

    // Errors
    error Wallet__DuplicateOwnersNotAllowed();
    error Wallet__ZeroAddressNotAllowed();
    error Wallet__ApprovalThresholdMustBeGreaterThanZero();
    error Wallet__ApprovalThresholdCannotBeBiggerThanOwnerCount();
    error Wallet__OwnersAreRequired();
    error Wallet__OwnerNotInvited();
    error Wallet__AmountShouldBeGreaterThanZero();
    error Wallet__NotTheOwner();
    error Wallet__InvalidTransactionIndex();
    error Wallet__OwnerHasAlreadyApproved();
    error Wallet__TransactionAlreadyExecuted();
    error Wallet__TransactionFailed();
    error Wallet__NotEnoughBalance();
    error Wallet__AlreadyAnOwner();
    error Wallet__TransactionStatusShouldBePending();
    error Wallet__TransactionNotApprovedByTheOwner();
    error Wallet__TransactionDoesNotHaveEnoughApprovals();

    // variables
    uint32 private s_approvalThreshold;
    uint256 private s_transactionCount;
    address[] private s_owners;
    mapping(uint256 => Transaction) private s_transactions;
    mapping(address => OwnerStatus) private s_ownerToOwnerStatus;

    constructor(address[] memory owners) {
        if (owners.length == 0) revert Wallet__OwnersAreRequired();


        for (uint256 i = 0; i < owners.length; i++) {
            _createInvitations(owners[i]);
            s_owners.push(owners[i]);
        }

        s_owners.push(msg.sender);
        s_ownerToOwnerStatus[msg.sender] = OwnerStatus.ACCEPTED;
        s_approvalThreshold = 1;

    }

    receive() external payable {}

    // External functions
    function acceptInvitation() external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.INVITED)
            revert Wallet__OwnerNotInvited();

        s_ownerToOwnerStatus[msg.sender] = OwnerStatus.ACCEPTED;
        _calculateApprovalThreshold();

        emit InvitationAccepted(msg.sender);
    }

    function declineInvitation() external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.INVITED)
            revert Wallet__OwnerNotInvited();

        _removeOwnerFromArray(msg.sender);
        s_ownerToOwnerStatus[msg.sender] = OwnerStatus.DECLINED;

        emit InvitationDeclined(msg.sender);
    }

    function leaveWallet() external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.ACCEPTED)
            revert Wallet__NotTheOwner();

        for (uint256 i = 0; i < s_transactionCount; i++) {
            Transaction storage txn = s_transactions[i];
            if (
                txn.ownerToHasApproved[msg.sender] &&
                txn.status != TransactionStatus.EXECUTED
            ) {
                txn.approvals--;
                txn.ownerToHasApproved[msg.sender] = false;
            }
        }

        _removeOwnerFromArray(msg.sender);

        s_ownerToOwnerStatus[msg.sender] = OwnerStatus.INVALID;

        _calculateApprovalThreshold();

        emit OwnerLeftTheWallet(msg.sender);
    }

    function inviteOwner(address owner) external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.ACCEPTED)
            revert Wallet__NotTheOwner();

        _createInvitations(owner);
        s_owners.push(owner);

        emit OwnerInvited(owner);
    }

    function removeInvitedOwner(address owner) external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.ACCEPTED)
            revert Wallet__NotTheOwner();
        if (owner == address(0)) revert Wallet__ZeroAddressNotAllowed();
        if (s_ownerToOwnerStatus[owner] != OwnerStatus.INVITED)
            revert Wallet__OwnerNotInvited();

        _removeOwnerFromArray(owner);
        s_ownerToOwnerStatus[owner] = OwnerStatus.INVALID;

        emit InvitedOwnerRemovedFromWallet(owner);
    }

    function createTransaction(uint256 amount, address recipient) external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.ACCEPTED)
            revert Wallet__NotTheOwner();
        if (recipient == address(0)) revert Wallet__ZeroAddressNotAllowed();
        if (amount == 0) revert Wallet__AmountShouldBeGreaterThanZero();

        uint256 transactionIndex = s_transactionCount;
        Transaction storage txn = s_transactions[transactionIndex];
        txn.amount = amount;
        txn.index = transactionIndex;
        txn.approvals = 1;
        txn.creator = msg.sender;
        txn.recipient = recipient;
        txn.status = TransactionStatus.PENDING;
        txn.ownerToHasApproved[msg.sender] = true;
        s_transactionCount++;

        emit TransactionCreated(
            msg.sender,
            recipient,
            amount,
            transactionIndex
        );
    }

    function approveTransaction(uint256 transactionIndex) external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.ACCEPTED)
            revert Wallet__NotTheOwner();
        if (transactionIndex >= s_transactionCount)
            revert Wallet__InvalidTransactionIndex();

        Transaction storage txn = s_transactions[transactionIndex];

        if (txn.status == TransactionStatus.EXECUTED)
            revert Wallet__TransactionAlreadyExecuted();
        if (txn.ownerToHasApproved[msg.sender])
            revert Wallet__OwnerHasAlreadyApproved();

        txn.approvals++;
        txn.ownerToHasApproved[msg.sender] = true;

        if (txn.approvals >= i_approvalThreshold) {
            txn.status = TransactionStatus.EXECUTED;
            _executeTransaction(txn);
        }

        emit TransactionApproved(msg.sender, transactionIndex);
    }

    function disapproveTransaction(uint256 transactionIndex) external {
        if (s_ownerToOwnerStatus[msg.sender] != OwnerStatus.ACCEPTED)
            revert Wallet__NotTheOwner();
        if (transactionIndex >= s_transactionCount)
            revert Wallet__InvalidTransactionIndex();

        Transaction storage txn = s_transactions[transactionIndex];

        if (txn.status != TransactionStatus.PENDING)
            revert Wallet__TransactionStatusShouldBePending();
        if (!txn.ownerToHasApproved[msg.sender])
            revert Wallet__TransactionNotApprovedByTheOwner();
        if (txn.approvals == 0)
            revert Wallet__TransactionDoesNotHaveEnoughApprovals();

        txn.approvals--;
        txn.ownerToHasApproved[msg.sender] = false;

        emit TransactionDisapproved(msg.sender, transactionIndex);
    }

    // Getter functions
    function getApprovalThreshold() external view returns (uint32) {
        return i_approvalThreshold;
    }

    function getTransactionCount() external view returns (uint256) {
        return s_transactionCount;
    }

    function getTransaction(
        uint256 transactionIndex
    )
        external
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint32,
            address[] memory,
            TransactionStatus
        )
    {
        if (transactionIndex >= s_transactionCount)
            revert Wallet__InvalidTransactionIndex();
        Transaction storage txn = s_transactions[transactionIndex];

        address[] memory ownerWhoHasApproved = new address[](txn.approvals);
        uint256 index = 0;

        for (uint256 i = 0; i < s_owners.length; i++) {
            if (txn.ownerToHasApproved[s_owners[i]]) {
                ownerWhoHasApproved[index] = s_owners[i];
                index++;
            }
        }

        return (
            txn.creator,
            txn.recipient,
            txn.amount,
            txn.index,
            txn.approvals,
            ownerWhoHasApproved,
            txn.status
        );
    }

    function getOwnerStatus(address owner) external view returns (OwnerStatus) {
        return s_ownerToOwnerStatus[owner];
    }

    function getOwners() external view returns (address[] memory) {
        return s_owners;
    }

    function getOwnerCount() external view returns (uint256) {
        return s_owners.length;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Internal functions
    function _createInvitations(address owner) internal {
        if (owner == address(0)) revert Wallet__ZeroAddressNotAllowed();
        if (s_ownerToOwnerStatus[owner] != OwnerStatus.INVALID)
            revert Wallet__DuplicateOwnersNotAllowed();
        s_ownerToOwnerStatus[owner] = OwnerStatus.INVITED;
    }

    function _executeTransaction(Transaction storage txn) internal {
        if (address(this).balance < txn.amount)
            revert Wallet__NotEnoughBalance();
        (bool success, ) = payable(txn.recipient).call{value: txn.amount}("");

        if (!success) {
            revert Wallet__TransactionFailed();
        }

        emit TransactionExecuted(txn.index);
    }

    function _removeOwnerFromArray(address owner) internal {
        uint256 len = s_owners.length;

        for (uint256 i = 0; i < len; i++) {
            if (s_owners[i] == owner) {
                s_owners[i] = s_owners[len - 1];
                s_owners.pop();
                break;
            }
        }
    }

    function _calculateApprovalThreshold() internal {
        uint256 acceptedOwners = 0, len = s_owners.length;

        for(uint256 i = 0; i < len; i++){
            if(s_ownerToOwnerStatus[s_owners[i]] == OwnerStatus.ACCEPTED) acceptedOwners++;
        }

        s_approvalThreshold = Math.ceilDiv(acceptedOwners*80,100);
    }
}
