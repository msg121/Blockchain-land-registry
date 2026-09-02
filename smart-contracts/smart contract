// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LandRegistry
 * @notice Secure, auditable and privacy-aware digital land registry.
 *
 * SECURITY NOTES:
 * - No personally identifiable information (PII) should be stored on-chain.
 * - Documents should be encrypted before uploading to IPFS.
 * - metadataHash stores only a cryptographic reference.
 * - Production admin roles should preferably be controlled by a multisig.
 */
contract LandRegistry is AccessControl, Pausable, ReentrancyGuard {
    // =============================================================
    //                           ROLES
    // =============================================================

    bytes32 public constant REGISTRAR_ROLE =
        keccak256("REGISTRAR_ROLE");

    bytes32 public constant VERIFIER_ROLE =
        keccak256("VERIFIER_ROLE");

    bytes32 public constant LEGAL_ROLE =
        keccak256("LEGAL_ROLE");

    bytes32 public constant EMERGENCY_ROLE =
        keccak256("EMERGENCY_ROLE");

    // =============================================================
    //                     VERIFICATION REASONS
    // =============================================================

    bytes32 private constant REASON_OWNERSHIP_CHANGED =
        keccak256("OWNERSHIP_CHANGED");

    bytes32 private constant REASON_METADATA_CHANGED =
        keccak256("METADATA_CHANGED");

    bytes32 private constant REASON_LEGAL_RECOVERY =
        keccak256("LEGAL_RECOVERY");

    // =============================================================
    //                        DATA MODEL
    // =============================================================

    struct Property {
        address owner;

        // Cryptographic reference to encrypted off-chain metadata.
        bytes32 metadataHash;

        bool verified;

        // Used for two-step ownership transfer.
        address pendingOwner;

        // Property area in a normalized unit.
        uint64 area;

        // Fixed-point coordinates using 1e6 precision.
        // Example:
        // 33.6844 => 33,684,400
        int32 latitudeE6;
        int32 longitudeE6;

        uint64 createdAt;
        uint64 updatedAt;
    }

    // =============================================================
    //                           STORAGE
    // =============================================================

    // Property ID => Property
    mapping(bytes32 => Property) private _properties;

    // Owner => Property IDs
    mapping(address => bytes32[]) private _ownedProperties;

    // Property ID => Index inside owner's array
    mapping(bytes32 => uint256) private _ownerPropertyIndex;

    // =============================================================
    //                           ERRORS
    // =============================================================

    error PropertyAlreadyExists(bytes32 propertyId);

    error PropertyNotFound(bytes32 propertyId);

    error InvalidAddress();

    error InvalidPropertyId();

    error InvalidMetadataHash();

    error InvalidArea();

    error InvalidCoordinates();

    error NotPropertyOwner();

    error NotPendingOwner();

    error PropertyAlreadyVerified();

    error TransferAlreadyPending();

    error NoPendingTransfer();

    error SameOwner();

    error CannotRecoverToZeroAddress();

    error CannotRecoverToCurrentOwner();

    error OwnerIndexCorrupted(
        address owner,
        bytes32 propertyId
    );

    // =============================================================
    //                           EVENTS
    // =============================================================

    event PropertyRegistered(
        bytes32 indexed propertyId,
        address indexed owner,
        bytes32 indexed metadataHash,
        uint64 area,
        int32 latitudeE6,
        int32 longitudeE6
    );

    event PropertyVerified(
        bytes32 indexed propertyId,
        address indexed verifier
    );

    event VerificationReset(
        bytes32 indexed propertyId,
        bytes32 reason
    );

    event TransferProposed(
        bytes32 indexed propertyId,
        address indexed currentOwner,
        address indexed pendingOwner
    );

    event TransferAccepted(
        bytes32 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner
    );

    event TransferCancelled(
        bytes32 indexed propertyId,
        address indexed owner,
        address indexed pendingOwner
    );

    event PropertyMetadataUpdated(
        bytes32 indexed propertyId,
        bytes32 indexed oldMetadataHash,
        bytes32 indexed newMetadataHash
    );

    /**
     * IMPORTANT:
     * Solidity allows a maximum of 3 indexed parameters
     * for a non-anonymous event.
     */
    event PropertyRecovered(
        bytes32 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        address authorizedBy
    );

    event EmergencyPaused(
        address indexed account
    );

    event EmergencyUnpaused(
        address indexed account
    );

    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================

    constructor(address admin) {
        if (admin == address(0)) {
            revert InvalidAddress();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        _grantRole(EMERGENCY_ROLE, admin);
    }

    // =============================================================
    //                     PROPERTY REGISTRATION
    // =============================================================

    /**
     * @notice Registers a new property.
     *
     * Only REGISTRAR_ROLE can register properties.
     *
     * New properties always start as:
     * verified = false
     */
    function registerProperty(
        bytes32 propertyId,
        address initialOwner,
        bytes32 metadataHash,
        uint64 area,
        int32 latitudeE6,
        int32 longitudeE6
    )
        external
        onlyRole(REGISTRAR_ROLE)
        whenNotPaused
        nonReentrant
    {
        if (propertyId == bytes32(0)) {
            revert InvalidPropertyId();
        }

        if (initialOwner == address(0)) {
            revert InvalidAddress();
        }

        if (metadataHash == bytes32(0)) {
            revert InvalidMetadataHash();
        }

        if (_properties[propertyId].owner != address(0)) {
            revert PropertyAlreadyExists(propertyId);
        }

        if (area == 0) {
            revert InvalidArea();
        }

        // Latitude:
        // -90.000000 to +90.000000
        //
        // Longitude:
        // -180.000000 to +180.000000
        if (
            latitudeE6 < -90_000_000 ||
            latitudeE6 > 90_000_000 ||
            longitudeE6 < -180_000_000 ||
            longitudeE6 > 180_000_000
        ) {
            revert InvalidCoordinates();
        }

        uint64 timestamp = uint64(block.timestamp);

        _properties[propertyId] = Property({
            owner: initialOwner,
            metadataHash: metadataHash,
            verified: false,
            pendingOwner: address(0),
            area: area,
            latitudeE6: latitudeE6,
            longitudeE6: longitudeE6,
            createdAt: timestamp,
            updatedAt: timestamp
        });

        _addPropertyToOwner(
            initialOwner,
            propertyId
        );

        emit PropertyRegistered(
            propertyId,
            initialOwner,
            metadataHash,
            area,
            latitudeE6,
            longitudeE6
        );
    }

    // =============================================================
    //                         VERIFICATION
    // =============================================================

    /**
     * @notice Verifies a property.
     *
     * Only VERIFIER_ROLE can verify.
     */
    function verifyProperty(
        bytes32 propertyId
    )
        external
        onlyRole(VERIFIER_ROLE)
        whenNotPaused
    {
        Property storage propertyData =
            _getProperty(propertyId);

        if (propertyData.verified) {
            revert PropertyAlreadyVerified();
        }

        propertyData.verified = true;

        propertyData.updatedAt =
            uint64(block.timestamp);

        emit PropertyVerified(
            propertyId,
            msg.sender
        );
    }

    // =============================================================
    //                    TWO-STEP OWNERSHIP
    // =============================================================

    /**
     * @notice Current owner proposes a transfer.
     *
     * Ownership does NOT change immediately.
     */
    function proposeTransfer(
        bytes32 propertyId,
        address newOwner
    )
        external
        whenNotPaused
        nonReentrant
    {
        if (newOwner == address(0)) {
            revert InvalidAddress();
        }

        Property storage propertyData =
            _getProperty(propertyId);

        if (propertyData.owner != msg.sender) {
            revert NotPropertyOwner();
        }

        if (newOwner == propertyData.owner) {
            revert SameOwner();
        }

        if (propertyData.pendingOwner != address(0)) {
            revert TransferAlreadyPending();
        }

        propertyData.pendingOwner = newOwner;

        propertyData.updatedAt =
            uint64(block.timestamp);

        emit TransferProposed(
            propertyId,
            msg.sender,
            newOwner
        );
    }

    /**
     * @notice Pending owner accepts the transfer.
     *
     * Ownership changes only after acceptance.
     */
    function acceptTransfer(
        bytes32 propertyId
    )
        external
        whenNotPaused
        nonReentrant
    {
        Property storage propertyData =
            _getProperty(propertyId);

        if (propertyData.pendingOwner == address(0)) {
            revert NoPendingTransfer();
        }

        if (propertyData.pendingOwner != msg.sender) {
            revert NotPendingOwner();
        }

        address previousOwner =
            propertyData.owner;

        // Update state first.
        propertyData.owner = msg.sender;

        propertyData.pendingOwner =
            address(0);

        propertyData.updatedAt =
            uint64(block.timestamp);

        // Ownership change invalidates verification.
        if (propertyData.verified) {
            propertyData.verified = false;

            emit VerificationReset(
                propertyId,
                REASON_OWNERSHIP_CHANGED
            );
        }

        // Update owner indexes.
        _removePropertyFromOwner(
            previousOwner,
            propertyId
        );

        _addPropertyToOwner(
            msg.sender,
            propertyId
        );

        emit TransferAccepted(
            propertyId,
            previousOwner,
            msg.sender
        );
    }

    /**
     * @notice Cancels a pending ownership transfer.
     */
    function cancelTransfer(
        bytes32 propertyId
    )
        external
        whenNotPaused
        nonReentrant
    {
        Property storage propertyData =
            _getProperty(propertyId);

        if (propertyData.owner != msg.sender) {
            revert NotPropertyOwner();
        }

        if (propertyData.pendingOwner == address(0)) {
            revert NoPendingTransfer();
        }

        address pendingOwner =
            propertyData.pendingOwner;

        propertyData.pendingOwner =
            address(0);

        propertyData.updatedAt =
            uint64(block.timestamp);

        emit TransferCancelled(
            propertyId,
            msg.sender,
            pendingOwner
        );
    }

    // =============================================================
    //                     METADATA MANAGEMENT
    // =============================================================

    /**
     * @notice Updates off-chain metadata reference.
     *
     * Only the current property owner can update it.
     */
    function updatePropertyMetadata(
        bytes32 propertyId,
        bytes32 newMetadataHash
    )
        external
        whenNotPaused
        nonReentrant
    {
        if (newMetadataHash == bytes32(0)) {
            revert InvalidMetadataHash();
        }

        Property storage propertyData =
            _getProperty(propertyId);

        if (propertyData.owner != msg.sender) {
            revert NotPropertyOwner();
        }

        bytes32 oldMetadataHash =
            propertyData.metadataHash;

        propertyData.metadataHash =
            newMetadataHash;

        propertyData.updatedAt =
            uint64(block.timestamp);

        // Metadata change invalidates verification.
        if (propertyData.verified) {
            propertyData.verified = false;

            emit VerificationReset(
                propertyId,
                REASON_METADATA_CHANGED
            );
        }

        emit PropertyMetadataUpdated(
            propertyId,
            oldMetadataHash,
            newMetadataHash
        );
    }

    // =============================================================
    //                       LEGAL RECOVERY
    // =============================================================

    /**
     * @notice Transfers ownership under an authorized legal process.
     *
     * Production recommendation:
     * LEGAL_ROLE should be controlled by a multisig.
     */
    function recoverOwnership(
        bytes32 propertyId,
        address newOwner
    )
        external
        onlyRole(LEGAL_ROLE)
        whenNotPaused
        nonReentrant
    {
        if (newOwner == address(0)) {
            revert CannotRecoverToZeroAddress();
        }

        Property storage propertyData =
            _getProperty(propertyId);

        address previousOwner =
            propertyData.owner;

        if (previousOwner == newOwner) {
            revert CannotRecoverToCurrentOwner();
        }

        // Update ownership.
        propertyData.owner = newOwner;

        // Cancel any pending transfer.
        propertyData.pendingOwner =
            address(0);

        // Legal ownership change requires verification.
        propertyData.verified = false;

        propertyData.updatedAt =
            uint64(block.timestamp);

        // Update indexes.
        _removePropertyFromOwner(
            previousOwner,
            propertyId
        );

        _addPropertyToOwner(
            newOwner,
            propertyId
        );

        emit VerificationReset(
            propertyId,
            REASON_LEGAL_RECOVERY
        );

        emit PropertyRecovered(
            propertyId,
            previousOwner,
            newOwner,
            msg.sender
        );
    }

    // =============================================================
    //                         EMERGENCY
    // =============================================================

    /**
     * @notice Pauses sensitive operations.
     */
    function pause()
        external
        onlyRole(EMERGENCY_ROLE)
    {
        _pause();

        emit EmergencyPaused(
            msg.sender
        );
    }

    /**
     * @notice Resumes operations.
     */
    function unpause()
        external
        onlyRole(EMERGENCY_ROLE)
    {
        _unpause();

        emit EmergencyUnpaused(
            msg.sender
        );
    }

    // =============================================================
    //                           VIEWS
    // =============================================================

    function getProperty(
        bytes32 propertyId
    )
        external
        view
        returns (Property memory)
    {
        return _getProperty(propertyId);
    }

    function ownerOf(
        bytes32 propertyId
    )
        external
        view
        returns (address)
    {
        return _getProperty(propertyId).owner;
    }

    function isVerified(
        bytes32 propertyId
    )
        external
        view
        returns (bool)
    {
        return _getProperty(propertyId).verified;
    }

    function pendingOwnerOf(
        bytes32 propertyId
    )
        external
        view
        returns (address)
    {
        return _getProperty(propertyId)
            .pendingOwner;
    }

    function getPropertiesByOwner(
        address owner
    )
        external
        view
        returns (bytes32[] memory)
    {
        if (owner == address(0)) {
            revert InvalidAddress();
        }

        return _ownedProperties[owner];
    }

    function propertyCount(
        address owner
    )
        external
        view
        returns (uint256)
    {
        if (owner == address(0)) {
            revert InvalidAddress();
        }

        return _ownedProperties[owner].length;
    }

    function propertyExists(
        bytes32 propertyId
    )
        external
        view
        returns (bool)
    {
        return
            propertyId != bytes32(0) &&
            _properties[propertyId].owner !=
            address(0);
    }

    // =============================================================
    //                     INTERNAL FUNCTIONS
    // =============================================================

    /**
     * @dev Returns the property or reverts if it does not exist.
     */
    function _getProperty(
        bytes32 propertyId
    )
        internal
        view
        returns (Property storage)
    {
        if (
            propertyId == bytes32(0) ||
            _properties[propertyId].owner ==
            address(0)
        ) {
            revert PropertyNotFound(
                propertyId
            );
        }

        return _properties[propertyId];
    }

    /**
     * @dev Adds a property to the owner's index.
     */
    function _addPropertyToOwner(
        address owner,
        bytes32 propertyId
    )
        internal
    {
        _ownerPropertyIndex[propertyId] =
            _ownedProperties[owner].length;

        _ownedProperties[owner].push(
            propertyId
        );
    }

    /**
     * @dev Removes property from owner index
     * using swap-and-pop.
     */
    function _removePropertyFromOwner(
        address owner,
        bytes32 propertyId
    )
        internal
    {
        bytes32[] storage properties =
            _ownedProperties[owner];

        uint256 length =
            properties.length;

        if (length == 0) {
            revert OwnerIndexCorrupted(
                owner,
                propertyId
            );
        }

        uint256 index =
            _ownerPropertyIndex[propertyId];

        // Defensive check:
        // Confirm the stored index actually
        // points to this property.
        if (
            index >= length ||
            properties[index] != propertyId
        ) {
            revert OwnerIndexCorrupted(
                owner,
                propertyId
            );
        }

        uint256 lastIndex =
            length - 1;

        if (index != lastIndex) {
            bytes32 lastPropertyId =
                properties[lastIndex];

            properties[index] =
                lastPropertyId;

            _ownerPropertyIndex[
                lastPropertyId
            ] = index;
        }

        properties.pop();

        delete _ownerPropertyIndex[
            propertyId
        ];
    }

    // =============================================================
    //                       ERC165 SUPPORT
    // =============================================================

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(
            interfaceId
        );
    }
}