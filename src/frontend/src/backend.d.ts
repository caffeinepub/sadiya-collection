import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: string;
    stockQuantity: bigint;
    imageUrls: Array<string>;
    name: string;
    createdAt: Time;
    description: string;
    discountPercent: bigint;
    isActive: boolean;
    category: string;
    price: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface ProductImage {
    blob: ExternalBlob;
    productId: string;
    uploadedAt: Time;
}
export interface Order {
    id: string;
    status: string;
    createdAt: Time;
    user: Principal;
    totalAmount: bigint;
    items: Array<CartItem>;
    paymentIntentId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ThemePreference {
    themeName: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Offer {
    id: string;
    name: string;
    discountPercent: bigint;
    isActive: boolean;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    productId: string;
    quantity: bigint;
}
export interface ContactInfo {
    email: string;
    address: string;
    phone: string;
}
export interface UserProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOffer(offer: Offer): Promise<void>;
    addProduct(product: Product): Promise<void>;
    addProductImage(productId: string, blob: ExternalBlob): Promise<void>;
    addToCart(item: CartItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    classifyImage(url: string): Promise<string>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteOffer(offerId: string): Promise<void>;
    deleteProduct(productId: string): Promise<void>;
    getActiveOffers(): Promise<Array<Offer>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactInfo(): Promise<ContactInfo>;
    getMyCart(): Promise<Array<CartItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getProductImages(productId: string): Promise<Array<ProductImage>>;
    getProducts(): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getThemePreference(): Promise<ThemePreference>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(cart: Array<CartItem>, totalAmount: bigint, paymentIntentId: string): Promise<string>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setThemePreference(theme: ThemePreference): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOffer(offer: Offer): Promise<void>;
    updateOrderStatus(orderId: string, status: string): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
