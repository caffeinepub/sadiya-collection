import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Mixins
  include MixinStorage();

  // Include authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    category : Text;
    price : Nat;
    imageUrls : [Text];
    stockQuantity : Nat;
    isActive : Bool;
    discountPercent : Nat;
    createdAt : Time.Time;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  let products = Map.empty<Text, Product>();

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
  };

  // Shopping Cart
  public type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, [CartItem]>();

  public shared ({ caller }) func addToCart(item : CartItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    let updatedCart = currentCart.concat([item]);
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    let updatedCart = currentCart.filter(func(item) { item.productId != productId });
    carts.add(caller, updatedCart);
  };

  public query ({ caller }) func getMyCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    carts.remove(caller);
  };

  // Order Management
  public type Order = {
    id : Text;
    user : Principal;
    items : [CartItem];
    totalAmount : Nat;
    status : Text;
    paymentIntentId : Text;
    createdAt : Time.Time;
  };

  let orders = Map.empty<Text, Order>();

  public shared ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    orders.values().toArray().filter(func(order) { order.user == caller });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func placeOrder(cart : [CartItem], totalAmount : Nat, paymentIntentId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    let orderId = paymentIntentId;
    let order : Order = {
      id = orderId;
      user = caller;
      items = cart;
      totalAmount;
      status = "pending";
      paymentIntentId;
      createdAt = Time.now();
    };

    orders.add(orderId, order);
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          user = order.user;
          items = order.items;
          totalAmount = order.totalAmount;
          status;
          paymentIntentId = order.paymentIntentId;
          createdAt = order.createdAt;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // Offers/Promotions
  public type Offer = {
    id : Text;
    name : Text;
    discountPercent : Nat;
    isActive : Bool;
  };

  module Offer {
    public func compare(o1 : Offer, o2 : Offer) : Order.Order {
      Text.compare(o1.name, o2.name);
    };
  };

  let offers = Map.empty<Text, Offer>();

  public query ({ caller }) func getActiveOffers() : async [Offer] {
    offers.values().toArray().filter(func(offer) { offer.isActive });
  };

  public shared ({ caller }) func addOffer(offer : Offer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add offers");
    };
    offers.add(offer.id, offer);
  };

  public shared ({ caller }) func updateOffer(offer : Offer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update offers");
    };
    offers.add(offer.id, offer);
  };

  public shared ({ caller }) func deleteOffer(offerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete offers");
    };
    offers.remove(offerId);
  };

  // Theme preference
  type ThemePreference = {
    themeName : Text;
  };

  module ThemePreference {
    public func compare(p1 : ThemePreference, p2 : ThemePreference) : Order.Order {
      Text.compare(p1.themeName, p2.themeName);
    };
  };

  let userThemes = Map.empty<Principal, ThemePreference>();

  public shared ({ caller }) func setThemePreference(theme : ThemePreference) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set theme preferences");
    };
    userThemes.add(caller, theme);
  };

  public query ({ caller }) func getThemePreference() : async ThemePreference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get theme preferences");
    };
    switch (userThemes.get(caller)) {
      case (null) { { themeName = "default" } };
      case (?theme) { theme };
    };
  };

  // Contact Info
  public type ContactInfo = {
    email : Text;
    phone : Text;
    address : Text;
  };

  public query ({ caller }) func getContactInfo() : async ContactInfo {
    {
      email = "support@sadiyacollection.com";
      phone = "+1234567890";
      address = "123 Bag Street, Bag City";
    };
  };

  // Blob Storage for Product Images
  public type ProductImage = {
    productId : Text;
    blob : Storage.ExternalBlob;
    uploadedAt : Time.Time;
  };

  module ProductImage {
    public func compare(img1 : ProductImage, img2 : ProductImage) : Order.Order {
      Text.compare(img1.productId, img2.productId);
    };
  };

  let productImages = Map.empty<Text, [ProductImage]>();

  public shared ({ caller }) func addProductImage(productId : Text, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add product images");
    };

    let newImage : ProductImage = {
      productId;
      blob;
      uploadedAt = Time.now();
    };

    let currentImages = switch (productImages.get(productId)) {
      case (null) { [] };
      case (?images) { images };
    };

    let updatedImages = currentImages.concat([newImage]);
    productImages.add(productId, updatedImages);
  };

  public query ({ caller }) func getProductImages(productId : Text) : async [ProductImage] {
    switch (productImages.get(productId)) {
      case (null) { [] };
      case (?images) { images };
    };
  };

  // Stripe Integration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfig := ?config;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get session status");
    };
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be configured") };
      case (?config) { await Stripe.getSessionStatus(config, sessionId, transform) };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be configured") };
      case (?config) {
        await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
      };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // PAYMENT GATEWAYS

  public type PaymentGateway = {
    id : Text;
    name : Text;
    apiKey : Text;
    secretKey : Text;
    isActive : Bool;
  };

  let paymentGateways = Map.empty<Text, PaymentGateway>();

  public type MaskedPaymentGateway = {
    id : Text;
    name : Text;
    isActive : Bool;
    maskedApiKey : Text;
    maskedSecretKey : Text;
  };

  public query ({ caller }) func getActivePaymentGateways() : async [MaskedPaymentGateway] {
    paymentGateways.values().toArray().filter(func(pg) { pg.isActive }).map(
      func(pg) {
        {
          id = pg.id;
          name = pg.name;
          isActive = pg.isActive;
          maskedApiKey = "***";
          maskedSecretKey = "***";
        };
      }
    );
  };

  public query ({ caller }) func getAllPaymentGateways() : async [PaymentGateway] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get all payment gateways");
    };
    paymentGateways.values().toArray();
  };

  public shared ({ caller }) func addPaymentGateway(gateway : PaymentGateway) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add payment gateways");
    };
    paymentGateways.add(gateway.id, gateway);
  };

  public shared ({ caller }) func updatePaymentGateway(gateway : PaymentGateway) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment gateways");
    };
    paymentGateways.add(gateway.id, gateway);
  };

  public shared ({ caller }) func deletePaymentGateway(gatewayId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete payment gateways");
    };
    paymentGateways.remove(gatewayId);
  };

  // REVIEWS

  public type Review = {
    id : Text;
    productId : Text;
    userId : Principal;
    userName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  let reviews = Map.empty<Text, Review>();

  public query ({ caller }) func getProductReviews(productId : Text) : async [Review] {
    reviews.values().toArray().filter(func(review) { review.productId == productId });
  };

  public query ({ caller }) func getAllReviews() : async [Review] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get all reviews");
    };
    reviews.values().toArray();
  };

  public shared ({ caller }) func addReview(review : Review) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };
    if (caller != review.userId) {
      Runtime.trap("Unauthorized: UserId does not match caller");
    };
    reviews.add(review.id, review);
  };

  public shared ({ caller }) func deleteReview(reviewId : Text) : async () {
    switch (reviews.get(reviewId)) {
      case (null) { Runtime.trap("Review not found") };
      case (?review) {
        if (caller != review.userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only review owner or admin can delete");
        };
        reviews.remove(reviewId);
      };
    };
  };

  // HTTP Outcall for Image Classification
  public shared ({ caller }) func classifyImage(url : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can classify images");
    };

    let apiKey = "Bearer PLACE_YOUR_HUGGING_FACE_KEY_HERE";
    let endpoint = "https://api-inference.huggingface.co/models/cahya/bert-base-indonesian-1.5b-sentiment-classification-smsa";

    let headers = [
      {
        name = "Content-Type";
        value = "application/json";
      },
      { name = "Authorization"; value = apiKey },
    ];

    let body = "{ \"url\": \"" # url # "\" }";

    await OutCall.httpPostRequest(endpoint, headers, body, transform);
  };
};
