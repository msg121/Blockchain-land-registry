const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LandRegistry", function () {
  let landRegistry;
  let admin;
  let registrar;
  let verifier;
  let user1;
  let user2;

  const propertyId = ethers.id("PROP-12345");
  const metadataHash = ethers.id("METADATA-IPFS-HASH");
  const area = 500; // 500 sq meters
  const latitude = 33684400; // 33.6844
  const longitude = -117826500; // -117.8265

  beforeEach(async function () {
    [admin, registrar, verifier, user1, user2] = await ethers.getSigners();

    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy(admin.address);
    // Hardhat 2 ethers v6 compatibility
    if (landRegistry.waitForDeployment) {
      await landRegistry.waitForDeployment();
    } else {
      await landRegistry.deployed();
    }

    // Roles
    const REGISTRAR_ROLE = await landRegistry.REGISTRAR_ROLE();
    const VERIFIER_ROLE = await landRegistry.VERIFIER_ROLE();

    // Admin grants roles
    await landRegistry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await landRegistry.connect(admin).grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const DEFAULT_ADMIN_ROLE = await landRegistry.DEFAULT_ADMIN_ROLE();
      expect(await landRegistry.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.equal(true);
    });
  });

  describe("Property Registration", function () {
    it("Should register a property successfully", async function () {
      await expect(
        landRegistry.connect(registrar).registerProperty(
          propertyId,
          user1.address,
          metadataHash,
          area,
          latitude,
          longitude
        )
      )
        .to.emit(landRegistry, "PropertyRegistered")
        .withArgs(propertyId, user1.address, metadataHash, area, latitude, longitude);

      const property = await landRegistry.getProperty(propertyId);
      expect(property.owner).to.equal(user1.address);
      expect(property.verified).to.equal(false);
      expect(property.area).to.equal(area);
    });

    it("Should fail if not registrar", async function () {
      await expect(
        landRegistry.connect(user1).registerProperty(
          propertyId,
          user1.address,
          metadataHash,
          area,
          latitude,
          longitude
        )
      ).to.be.revertedWithCustomError(landRegistry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Property Verification", function () {
    beforeEach(async function () {
      await landRegistry.connect(registrar).registerProperty(
        propertyId,
        user1.address,
        metadataHash,
        area,
        latitude,
        longitude
      );
    });

    it("Should verify a property successfully", async function () {
      await expect(landRegistry.connect(verifier).verifyProperty(propertyId))
        .to.emit(landRegistry, "PropertyVerified")
        .withArgs(propertyId, verifier.address);

      expect(await landRegistry.isVerified(propertyId)).to.equal(true);
    });
  });

  describe("Property Transfer", function () {
    beforeEach(async function () {
      await landRegistry.connect(registrar).registerProperty(
        propertyId,
        user1.address,
        metadataHash,
        area,
        latitude,
        longitude
      );
    });

    it("Should propose and accept a transfer successfully", async function () {
      // User1 proposes transfer to User2
      await expect(landRegistry.connect(user1).proposeTransfer(propertyId, user2.address))
        .to.emit(landRegistry, "TransferProposed")
        .withArgs(propertyId, user1.address, user2.address);

      expect(await landRegistry.pendingOwnerOf(propertyId)).to.equal(user2.address);

      // User2 accepts transfer
      await expect(landRegistry.connect(user2).acceptTransfer(propertyId))
        .to.emit(landRegistry, "TransferAccepted")
        .withArgs(propertyId, user1.address, user2.address);

      expect(await landRegistry.ownerOf(propertyId)).to.equal(user2.address);
      expect(await landRegistry.pendingOwnerOf(propertyId)).to.equal(ethers.ZeroAddress);
    });
  });
});
