import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";

module {
  type OldOrder = {
    id : Text;
    user : Principal;
    items : [{
      productId : Text;
      quantity : Nat;
    }];
    totalAmount : Nat;
    status : Text;
    paymentIntentId : Text;
    trackingNumber : Text;
    shippingCarrier : Text;
    createdAt : Time.Time;
  };

  type NewOrder = {
    id : Text;
    user : Principal;
    items : [{
      productId : Text;
      quantity : Nat;
    }];
    totalAmount : Nat;
    status : Text;
    paymentIntentId : Text;
    trackingNumber : Text;
    shippingCarrier : Text;
    createdAt : Time.Time;
    deliveredAt : Time.Time;
  };

  type OldActor = {
    orders : Map.Map<Text, OldOrder>;
  };

  type NewActor = {
    orders : Map.Map<Text, NewOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Text, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        { oldOrder with deliveredAt = 0 };
      }
    );
    { orders = newOrders };
  };
};
