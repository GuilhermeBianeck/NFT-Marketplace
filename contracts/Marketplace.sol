// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/common/ERC2981.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Marketplace is ERC721URIStorage, ERC2981, ReentrancyGuard, Pausable {
  using Counters for Counters.Counter;
  using SafeERC20 for IERC20;
  Counters.Counter private _tokenIds;

  address payable private _owner;
  address payable private _pendingOwner;
  uint256 private _listingPrice = 0.00082 ether;
  uint256 private _maxListingPrice = 1 ether;
  uint256 private _accumulatedFees;
  uint256 private _totalPendingWithdrawals;

  struct MarketItem {
    uint256 tokenId;
    uint256 price;
    address payable seller;
    address payable owner;
    uint96 listingFee;
    bool sold;
    bool frozen;
  }

  uint256 private _activeListingCount;
  mapping(uint256 => MarketItem) private idToMarketItem;
  mapping(address => uint256) private _pendingWithdrawals;

  // --- Events ---

  event MarketItemCreated(
    uint256 indexed tokenId,
    address indexed seller,
    uint256 price
  );

  event MarketItemSold(
    uint256 indexed tokenId,
    address indexed seller,
    address indexed buyer,
    uint256 price
  );

  event MarketItemCancelled(
    uint256 indexed tokenId,
    address indexed seller
  );

  event MarketItemRelisted(
    uint256 indexed tokenId,
    address indexed seller,
    uint256 price
  );

  event MarketItemPriceUpdated(
    uint256 indexed tokenId,
    uint256 oldPrice,
    uint256 newPrice
  );

  event ListingPriceUpdated(uint256 oldPrice, uint256 newPrice);
  event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event FeesWithdrawn(address indexed to, uint256 amount);
  event FundsWithdrawn(address indexed to, uint256 amount);
  event TokenURIFrozen(uint256 indexed tokenId);
  event RoyaltySet(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);
  event ERC20Rescued(address indexed token, address indexed to, uint256 amount);

  // --- Modifiers ---

  modifier onlyOwner() {
    require(msg.sender == _owner, 'Only marketplace owner');
    _;
  }

  // --- Constructor ---

  constructor() ERC721('NFT-Marketplace', 'NFT') {
    _owner = payable(msg.sender);
  }

  // ======================
  //  CORE MARKETPLACE
  // ======================

  /// @notice Mint a token and list it in the marketplace
  function createToken(
    string memory tokenURI,
    uint256 price,
    address royaltyReceiver,
    uint96 royaltyFee
  ) public payable nonReentrant whenNotPaused returns (uint256) {
    require(price > 0, 'Price must be at least 1 wei');
    require(msg.value == _listingPrice, 'Must pay listing price');
    require(_listingPrice <= type(uint96).max, 'Listing price overflow');

    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();

    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, tokenURI);

    // Set royalty if provided
    if (royaltyReceiver != address(0) && royaltyFee > 0) {
      _setTokenRoyalty(newTokenId, royaltyReceiver, royaltyFee);
      emit RoyaltySet(newTokenId, royaltyReceiver, royaltyFee);
    }

    idToMarketItem[newTokenId] = MarketItem(
      newTokenId,
      price,
      payable(msg.sender),
      payable(address(this)),
      uint96(_listingPrice),
      false,
      false
    );

    _activeListingCount++;
    _accumulatedFees += _listingPrice;

    _transfer(msg.sender, address(this), newTokenId);
    emit MarketItemCreated(newTokenId, msg.sender, price);

    return newTokenId;
  }

  /// @notice Purchase a listed marketplace item (pull-payment pattern)
  function createMarketSale(uint256 tokenId)
    public
    payable
    nonReentrant
    whenNotPaused
  {
    MarketItem storage item = idToMarketItem[tokenId];
    require(item.tokenId > 0, 'Item does not exist');
    require(!item.sold, 'Item already sold');
    require(item.owner == address(this), 'Item not listed');
    require(msg.value == item.price, 'Must submit asking price');
    require(msg.sender != item.seller, 'Cannot buy your own listing');

    address payable seller = item.seller;
    uint256 fee = item.listingFee;

    // Calculate royalty
    uint256 royaltyAmount = 0;
    address royaltyReceiver = address(0);
    try this.royaltyInfo(tokenId, item.price) returns (
      address receiver,
      uint256 amount
    ) {
      royaltyReceiver = receiver;
      royaltyAmount = amount;
    } catch {}

    // Effects first (CEI pattern)
    item.owner = payable(msg.sender);
    item.sold = true;
    item.seller = payable(address(0));
    _activeListingCount--;

    // Safety cap on royalty
    if (royaltyAmount > msg.value) {
      royaltyAmount = 0;
      royaltyReceiver = address(0);
    }

    // Pull-payment: credit balances instead of pushing
    _accumulatedFees -= fee;
    _pendingWithdrawals[_owner] += fee;
    _totalPendingWithdrawals += fee;

    uint256 sellerProceeds = msg.value - royaltyAmount;
    _pendingWithdrawals[seller] += sellerProceeds;
    _totalPendingWithdrawals += sellerProceeds;

    if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
      _pendingWithdrawals[royaltyReceiver] += royaltyAmount;
      _totalPendingWithdrawals += royaltyAmount;
    }

    _transfer(address(this), msg.sender, tokenId);
    emit MarketItemSold(tokenId, seller, msg.sender, item.price);
  }

  /// @notice Cancel a listing and return the NFT (fee refunded)
  function cancelListing(uint256 tokenId) public nonReentrant {
    MarketItem storage item = idToMarketItem[tokenId];
    require(item.tokenId > 0, 'Item does not exist');
    require(!item.sold, 'Item already sold');
    require(item.seller == msg.sender, 'Only seller can cancel');
    require(item.owner == address(this), 'Item not listed');

    uint256 refund = item.listingFee;

    item.owner = payable(msg.sender);
    item.sold = true;
    item.seller = payable(address(0));
    _activeListingCount--;

    // Refund listing fee via pull-payment
    _accumulatedFees -= refund;
    _pendingWithdrawals[msg.sender] += refund;
    _totalPendingWithdrawals += refund;

    _transfer(address(this), msg.sender, tokenId);
    emit MarketItemCancelled(tokenId, msg.sender);
  }

  /// @notice Update the price of a listed item
  function updateItemPrice(uint256 tokenId, uint256 newPrice)
    public
    nonReentrant
    whenNotPaused
  {
    MarketItem storage item = idToMarketItem[tokenId];
    require(item.tokenId > 0, 'Item does not exist');
    require(!item.sold, 'Item already sold');
    require(item.seller == msg.sender, 'Only seller can update price');
    require(newPrice > 0, 'Price must be at least 1 wei');

    uint256 oldPrice = item.price;
    item.price = newPrice;

    emit MarketItemPriceUpdated(tokenId, oldPrice, newPrice);
  }

  /// @notice Resell a purchased token
  function resellToken(uint256 tokenId, uint256 price)
    public
    payable
    nonReentrant
    whenNotPaused
  {
    MarketItem storage item = idToMarketItem[tokenId];
    require(item.owner == msg.sender, 'Only item owner can resell');
    require(msg.value == _listingPrice, 'Must pay listing price');
    require(price > 0, 'Price must be at least 1 wei');
    require(_listingPrice <= type(uint96).max, 'Listing price overflow');

    item.sold = false;
    item.price = price;
    item.listingFee = uint96(_listingPrice);
    item.seller = payable(msg.sender);
    item.owner = payable(address(this));
    _activeListingCount++;
    _accumulatedFees += _listingPrice;

    _transfer(msg.sender, address(this), tokenId);
    emit MarketItemRelisted(tokenId, msg.sender, price);
  }

  // ======================
  //  PULL-PAYMENT
  // ======================

  /// @notice Withdraw accumulated funds (fees, sale proceeds, royalties)
  function withdraw() public nonReentrant {
    uint256 amount = _pendingWithdrawals[msg.sender];
    require(amount > 0, 'No funds to withdraw');

    _pendingWithdrawals[msg.sender] = 0;
    _totalPendingWithdrawals -= amount;

    (bool success, ) = msg.sender.call{value: amount}('');
    require(success, 'Withdrawal failed');

    emit FundsWithdrawn(msg.sender, amount);
  }

  /// @notice Check pending withdrawal balance
  function pendingWithdrawal(address account) public view returns (uint256) {
    return _pendingWithdrawals[account];
  }

  // ======================
  //  TOKEN URI FREEZE
  // ======================

  /// @notice Freeze token URI to prevent bait-and-switch
  function freezeTokenURI(uint256 tokenId) public {
    require(idToMarketItem[tokenId].tokenId > 0, 'Item does not exist');
    require(
      idToMarketItem[tokenId].seller == msg.sender ||
        idToMarketItem[tokenId].owner == msg.sender ||
        msg.sender == _owner,
      'Only seller, owner, or admin can freeze'
    );
    idToMarketItem[tokenId].frozen = true;
    emit TokenURIFrozen(tokenId);
  }

  /// @notice Check if token URI is frozen
  function isTokenURIFrozen(uint256 tokenId) public view returns (bool) {
    return idToMarketItem[tokenId].frozen;
  }

  // ======================
  //  VIEW FUNCTIONS
  // ======================

  /// @notice Get a single market item by tokenId
  function getMarketItem(uint256 tokenId)
    public
    view
    returns (MarketItem memory)
  {
    require(idToMarketItem[tokenId].tokenId > 0, 'Item does not exist');
    return idToMarketItem[tokenId];
  }

  /// @notice Return all unsold market items (paginated)
  function fetchMarketItems(uint256 offset, uint256 limit)
    public
    view
    returns (MarketItem[] memory items, uint256 total)
  {
    total = _activeListingCount;
    uint256 itemCount = _tokenIds.current();
    uint256 collected = 0;
    uint256 skipped = 0;

    // First pass: determine actual result size
    uint256 resultSize = 0;
    for (uint256 i = 0; i < itemCount && resultSize < limit; i++) {
      if (idToMarketItem[i + 1].owner == address(this) && !idToMarketItem[i + 1].sold) {
        if (skipped >= offset) {
          resultSize++;
        }
        skipped++;
      }
    }

    items = new MarketItem[](resultSize);
    skipped = 0;
    for (uint256 i = 0; i < itemCount && collected < resultSize; i++) {
      if (idToMarketItem[i + 1].owner == address(this) && !idToMarketItem[i + 1].sold) {
        if (skipped >= offset) {
          items[collected] = idToMarketItem[i + 1];
          collected++;
        }
        skipped++;
      }
    }
  }

  /// @notice Legacy: return all unsold market items (no pagination)
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemCount = _tokenIds.current();
    uint256 activeCount = 0;

    for (uint256 i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(this) && !idToMarketItem[i + 1].sold) {
        activeCount++;
      }
    }

    MarketItem[] memory items = new MarketItem[](activeCount);
    uint256 idx = 0;
    for (uint256 i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(this) && !idToMarketItem[i + 1].sold) {
        items[idx] = idToMarketItem[i + 1];
        idx++;
      }
    }
    return items;
  }

  /// @notice Return items owned by the caller
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _tokenIds.current();
    uint256 itemCount = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount++;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    uint256 idx = 0;
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        items[idx] = idToMarketItem[i + 1];
        idx++;
      }
    }
    return items;
  }

  /// @notice Return items listed by the caller
  function fetchItemsListed() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _tokenIds.current();
    uint256 itemCount = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount++;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    uint256 idx = 0;
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        items[idx] = idToMarketItem[i + 1];
        idx++;
      }
    }
    return items;
  }

  /// @notice Stats
  function totalItemsListed() public view returns (uint256) {
    return _activeListingCount;
  }

  function totalItemsMinted() public view returns (uint256) {
    return _tokenIds.current();
  }

  // ======================
  //  ADMIN
  // ======================

  /// @notice Update the listing price
  function updateListingPrice(uint256 newListingPrice) public onlyOwner {
    require(newListingPrice > 0, 'Must be greater than 0');
    require(newListingPrice <= _maxListingPrice, 'Exceeds max listing price');
    uint256 oldPrice = _listingPrice;
    _listingPrice = newListingPrice;
    emit ListingPriceUpdated(oldPrice, newListingPrice);
  }

  /// @notice Update the max listing price cap
  function updateMaxListingPrice(uint256 newMax) public onlyOwner {
    require(newMax > 0, 'Must be greater than 0');
    _maxListingPrice = newMax;
  }

  function getListingPrice() public view returns (uint256) {
    return _listingPrice;
  }

  /// @notice Pause the marketplace (emergency stop)
  function pause() public onlyOwner {
    _pause();
  }

  /// @notice Unpause the marketplace
  function unpause() public onlyOwner {
    _unpause();
  }

  // ======================
  //  OWNERSHIP (2-step)
  // ======================

  /// @notice Start ownership transfer (step 1)
  function transferOwnership(address payable newOwner) public onlyOwner {
    require(newOwner != address(0), 'Cannot be zero address');
    _pendingOwner = newOwner;
    emit OwnershipTransferStarted(_owner, newOwner);
  }

  /// @notice Accept ownership transfer (step 2)
  function acceptOwnership() public {
    require(msg.sender == _pendingOwner, 'Not the pending owner');
    emit OwnershipTransferred(_owner, _pendingOwner);
    _owner = _pendingOwner;
    _pendingOwner = payable(address(0));
  }

  function getOwner() public view returns (address) {
    return _owner;
  }

  // ======================
  //  RESCUE FUNCTIONS
  // ======================

  /// @notice Rescue ERC20 tokens accidentally sent to this contract
  function rescueERC20(address token, address to, uint256 amount)
    public
    onlyOwner
  {
    require(to != address(0), 'Cannot send to zero address');
    IERC20(token).safeTransfer(to, amount);
    emit ERC20Rescued(token, to, amount);
  }

  /// @notice Rescue excess ETH (only ETH not owed to anyone)
  function rescueETH(address payable to, uint256 amount) public onlyOwner {
    require(to != address(0), 'Cannot send to zero address');
    uint256 totalOwed = _accumulatedFees + _totalPendingWithdrawals;
    require(address(this).balance >= totalOwed, 'Balance inconsistency');
    uint256 available = address(this).balance - totalOwed;
    require(amount <= available, 'Cannot withdraw owed funds');

    (bool success, ) = to.call{value: amount}('');
    require(success, 'Rescue failed');
  }

  receive() external payable {}

  // ======================
  //  ERC721 OVERRIDES
  // ======================

  /// @notice Block transfers of listed items - allow transfers of owned items
  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public virtual override {
    // Internal marketplace transfers always allowed
    if (from != address(this) && to != address(this)) {
      // External transfer: only allow if item is owned by sender (not listed)
      MarketItem storage item = idToMarketItem[tokenId];
      require(item.sold || item.owner != address(this), 'Cannot transfer listed item');
    }
    super.transferFrom(from, to, tokenId);
  }

  /// @notice Block safe transfers of listed items - allow transfers of owned items
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) public virtual override {
    if (from != address(this) && to != address(this)) {
      MarketItem storage item = idToMarketItem[tokenId];
      require(item.sold || item.owner != address(this), 'Cannot transfer listed item');
    }
    super.safeTransferFrom(from, to, tokenId, data);
  }

  /// @notice Override supportsInterface for ERC2981 + ERC721
  function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721, ERC2981)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  /// @notice Override _burn for ERC2981 cleanup
  function _burn(uint256 tokenId) internal virtual override {
    super._burn(tokenId);
    _resetTokenRoyalty(tokenId);
  }

  /// @notice Override tokenURI setter to enforce freeze
  function _setTokenURI(uint256 tokenId, string memory _tokenURI)
    internal
    virtual
    override
  {
    require(!idToMarketItem[tokenId].frozen, 'Token URI is frozen');
    super._setTokenURI(tokenId, _tokenURI);
  }
}
