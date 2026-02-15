import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    role: ProfileRole;
    email: string;
    verificationStatus: VerificationStatus;
    contactDetails: ContactDetails;
}
export interface SuccessResponse {
    restGapWarning?: RestGapWarning;
    booking: Booking;
    simultaneousEvents: Array<SimultaneousEventWarning>;
}
export interface SimultaneousEventWarning {
    startTime: string;
    clubName: string;
    eventDescription: string;
    endTime: string;
    venue: string;
    expectedAudience: bigint;
    contactDetails: ContactDetails;
}
export interface RestGapWarning {
    message: string;
    conflictType: string;
}
export interface ValidationWarning {
    restGapWarning?: RestGapWarning;
    simultaneousEventWarnings: Array<SimultaneousEventWarning>;
}
export interface Booking {
    id: bigint;
    startTime: string;
    status: BookingStatus;
    clubName: string;
    eventDescription: string;
    clubContact: ContactDetails;
    endTime: string;
    venue: string;
    date: string;
    expectedAudience: bigint;
}
export interface ContactDetails {
    name: string;
    phone: string;
}
export type BookingResponse = {
    __kind__: "conflict";
    conflict: ConflictResponse;
} | {
    __kind__: "success";
    success: SuccessResponse;
};
export interface ConflictResponse {
    conflictingBooking: Booking;
    message: string;
}
export interface VerificationRequest {
    status: VerificationStatus;
    principal: Principal;
    email: string;
    contactDetails: ContactDetails;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ProfileRole {
    studentCoordinator = "studentCoordinator",
    faculty = "faculty",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VerificationStatus {
    verified = "verified",
    pending = "pending",
    unverified = "unverified"
}
export interface backendInterface {
    approveVerificationRequest(studentCoordinatorPrincipal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    cancelBookings(bookingIds: Array<bigint>): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPendingVerificationRequests(): Promise<Array<VerificationRequest>>;
    getTodaysSchedule(today: string): Promise<Array<Booking>>;
    getUpcomingUserBookings(currentDate: string): Promise<Array<Booking>>;
    getUserBookings(): Promise<Array<Booking>>;
    getUserNotifications(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserRegistered(): Promise<boolean>;
    isVerifiedForBookings(): Promise<boolean>;
    previewBooking(clubName: string, eventDescription: string, clubContact: ContactDetails, venue: string, date: string, startTime: string, endTime: string, expectedAudience: bigint): Promise<ValidationWarning | null>;
    registerProfile(email: string, role: ProfileRole, contactDetails: ContactDetails): Promise<void>;
    rejectVerificationRequest(studentCoordinatorPrincipal: Principal): Promise<void>;
    requestBooking(clubName: string, eventDescription: string, clubContact: ContactDetails, venue: string, date: string, startTime: string, endTime: string, expectedAudience: bigint, confirmRestGap: boolean): Promise<BookingResponse>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
