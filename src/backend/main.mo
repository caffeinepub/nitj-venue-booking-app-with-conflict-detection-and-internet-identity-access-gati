import Iter "mo:core/Iter";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type BookingStatus = {
    #pending;
    #approved;
    #rejected;
    #cancelled;
  };

  type ContactDetails = {
    name : Text;
    phone : Text;
  };

  public type Booking = {
    id : Nat;
    clubName : Text;
    eventDescription : Text;
    clubContact : ContactDetails;
    venue : Text;
    date : Text;
    startTime : Text;
    endTime : Text;
    status : BookingStatus;
    expectedAudience : Nat;
  };

  public type BookingResponse = {
    #conflict : ConflictResponse;
    #success : SuccessResponse;
  };

  public type BookingPreview = {
    conflicts : [ConflictResponse];
    warnings : [ValidationWarning];
  };

  public type ValidationWarning = {
    simultaneousEventWarnings : [SimultaneousEventWarning];
    restGapWarning : ?RestGapWarning;
  };

  public type ConflictResponse = {
    conflictingBooking : Booking;
    message : Text;
  };

  public type SuccessResponse = {
    booking : Booking;
    simultaneousEvents : [SimultaneousEventWarning];
    restGapWarning : ?RestGapWarning;
  };

  public type SimultaneousEventWarning = {
    clubName : Text;
    eventDescription : Text;
    venue : Text;
    contactDetails : ContactDetails;
    startTime : Text;
    endTime : Text;
    expectedAudience : Nat;
  };

  public type RestGapWarning = {
    conflictType : Text;
    message : Text;
  };

  // New role and verification types
  public type ProfileRole = {
    #student;
    #studentCoordinator;
    #faculty;
  };

  public type VerificationStatus = {
    #unverified;
    #pending;
    #verified;
  };

  public type UserProfile = {
    email : Text;
    role : ProfileRole;
    verificationStatus : VerificationStatus;
    contactDetails : ContactDetails;
  };

  type Profile = {
    email : Text;
    role : ProfileRole;
    verificationStatus : VerificationStatus;
    contactDetails : ContactDetails;
  };

  public type VerificationRequest = {
    principal : Principal;
    email : Text;
    contactDetails : ContactDetails;
    status : VerificationStatus;
  };

  module Booking {
    public func compareById(booking1 : Booking, booking2 : Booking) : Order.Order {
      Nat.compare(booking1.id, booking2.id);
    };
  };

  let bookings = Map.empty<Principal, [Booking]>();
  var nextBookingId = 0;
  let profiles = Map.empty<Principal, Profile>();

  // New helper functions for role and verification checks
  func requireVerifiedBookingPermissions(caller : Principal) {
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Not Registered") };
      case (?profile) {
        switch (profile.role) {
          case (#student) {
            Runtime.trap("Unauthorized: Student users have read-only access");
          };
          case (#studentCoordinator) {
            switch (profile.verificationStatus) {
              case (#unverified) {
                Runtime.trap("Unauthorized: Student Coordinator must be verified by Faculty to access booking features");
              };
              case (#pending) {
                Runtime.trap("Unauthorized: Student Coordinator is currently under review, pending verification by Faculty");
              };
              case (#verified) {};
            };
          };
          case (#faculty) {};
        };
      };
    };
  };

  // Public function (needed for client-side role switching)
  public query ({ caller }) func isVerifiedForBookings() : async Bool {
    switch (profiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#student) { false };
          // Only verified student coordinators should return true
          case (#studentCoordinator) {
            switch (profile.verificationStatus) {
              case (#verified) { true };
              case (#unverified) { false };
              case (#pending) { false };
            };
          };
          case (#faculty) { true };
        };
      };
    };
  };

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { null };
      case (?profile) {
        ?{
          email = profile.email;
          role = profile.role;
          verificationStatus = profile.verificationStatus;
          contactDetails = profile.contactDetails;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { null };
      case (?profile) {
        ?{
          email = profile.email;
          role = profile.role;
          verificationStatus = profile.verificationStatus;
          contactDetails = profile.contactDetails;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    if (not isValidNitjEmail(profile.email)) {
      Runtime.trap("Invalid NITJ email address");
    };
    profiles.add(caller, {
      email = profile.email;
      role = profile.role;
      verificationStatus = profile.verificationStatus;
      contactDetails = profile.contactDetails;
    });
  };

  // Updated Registration
  public shared ({ caller }) func registerProfile(email : Text, role : ProfileRole, contactDetails : ContactDetails) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can register profiles");
    };
    switch (profiles.get(caller)) {
      case (null) {
        if (not isValidNitjEmail(email)) {
          Runtime.trap("Invalid NITJ email address") : ();
        } else {
          let verificationStatus = if (role == #studentCoordinator) {
            #pending;
          } else {
            #verified;
          };
          profiles.add(
            caller,
            {
              email;
              role;
              verificationStatus;
              contactDetails;
            },
          );
        };
      };
      case (?_) { Runtime.trap("This principal is already registered") };
    };
  };

  func isValidNitjEmail(email : Text) : Bool {
    email.endsWith(#text "nitj.ac.in");
  };

  public query ({ caller }) func isUserRegistered() : async Bool {
    profiles.containsKey(caller);
  };

  // Faculty Verification Workflow
  public query ({ caller }) func getPendingVerificationRequests() : async [VerificationRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only faculty members can view verification requests");
    };
    let pendingRequests = List.empty<VerificationRequest>();

    for ((principal, profile) in profiles.entries()) {
      if (profile.role == #studentCoordinator and profile.verificationStatus == #pending) {
        pendingRequests.add({
          principal = principal;
          email = profile.email;
          contactDetails = profile.contactDetails;
          status = profile.verificationStatus;
        });
      };
    };

    pendingRequests.toArray();
  };

  public shared ({ caller }) func approveVerificationRequest(studentCoordinatorPrincipal : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only faculty members can approve verification requests");
    };
    switch (profiles.get(studentCoordinatorPrincipal)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?profile) {
        if (profile.role != #studentCoordinator) {
          Runtime.trap("User is not a Student Coordinator");
        };
        if (profile.verificationStatus != #pending) {
          Runtime.trap("Verification not in pending state");
        };
        profiles.add(
          studentCoordinatorPrincipal,
          {
            profile with
            verificationStatus = #verified;
          },
        );
      };
    };
  };

  public shared ({ caller }) func rejectVerificationRequest(studentCoordinatorPrincipal : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only faculty members can reject verification requests");
    };
    switch (profiles.get(studentCoordinatorPrincipal)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?profile) {
        if (profile.role != #studentCoordinator) {
          Runtime.trap("User is not a Student Coordinator");
        };
        if (profile.verificationStatus != #pending) {
          Runtime.trap("Verification not in pending state");
        };
        profiles.add(
          studentCoordinatorPrincipal,
          {
            profile with
            verificationStatus = #unverified;
          },
        );
      };
    };
  };

  // Booking Functions with Updated Checks
  public shared ({ caller }) func requestBooking(
    clubName : Text,
    eventDescription : Text,
    clubContact : ContactDetails,
    venue : Text,
    date : Text,
    startTime : Text,
    endTime : Text,
    expectedAudience : Nat,
    confirmRestGap : Bool
  ) : async BookingResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can request bookings");
    };
    // Enforce proper permissions (students, unverified & pending coordinators have read-only)
    requireVerifiedBookingPermissions(caller);

    checkConflictsAndBook(
      caller,
      clubName,
      eventDescription,
      clubContact,
      venue,
      date,
      startTime,
      endTime,
      expectedAudience,
      confirmRestGap,
    );
  };

  func checkConflictsAndBook(
    caller : Principal,
    clubName : Text,
    eventDescription : Text,
    clubContact : ContactDetails,
    venue : Text,
    date : Text,
    startTime : Text,
    endTime : Text,
    expectedAudience : Nat,
    confirmRestGap : Bool
  ) : BookingResponse {
    switch (checkHardConflict(venue, date, startTime, endTime)) {
      case (?conflict) {
        let conflictResponse : ConflictResponse = {
          conflictingBooking = conflict;
          message = "Booking overlaps with existing event in this venue. CLUB: " # conflict.clubName # " | " # conflict.clubContact.name;
        };
        return #conflict(conflictResponse);
      };
      case (null) {
        let (simultaneousWarnings, restGapWarning) = calculateWarnings(venue, date, startTime, endTime);

        switch (restGapWarning) {
          case (?_) {
            if (not confirmRestGap) {
              Runtime.trap("15-minute rest gap confirmation required for this booking.");
            };
          };
          case (null) {};
        };

        let booking = createAndPersistBooking(
          caller,
          clubName,
          eventDescription,
          clubContact,
          venue,
          date,
          startTime,
          endTime,
          expectedAudience,
        );

        let successResponse : SuccessResponse = {
          booking;
          simultaneousEvents = simultaneousWarnings;
          restGapWarning;
        };
        #success(successResponse);
      };
    };
  };

  func createAndPersistBooking(
    caller : Principal,
    clubName : Text,
    eventDescription : Text,
    clubContact : ContactDetails,
    venue : Text,
    date : Text,
    startTime : Text,
    endTime : Text,
    expectedAudience : Nat
  ) : Booking {
    let newBooking : Booking = {
      id = nextBookingId;
      clubName;
      eventDescription;
      clubContact;
      venue;
      date;
      startTime;
      endTime;
      status = #approved;
      expectedAudience;
    };

    let currentBookings = switch (bookings.get(caller)) {
      case (null) { [] : [Booking] };
      case (?existingBookings) { existingBookings };
    };

    bookings.add(caller, currentBookings.concat([newBooking]));
    nextBookingId += 1;
    newBooking;
  };

  func checkHardConflict(venue : Text, date : Text, startTime : Text, endTime : Text) : ?Booking {
    for ((_, personBookings) in bookings.entries()) {
      for (booking in personBookings.values()) {
        if (shouldReturnBookingOnConflict(venue, date, startTime, endTime, booking)) {
          return ?booking;
        };
      };
    };
    null;
  };

  func shouldReturnBookingOnConflict(venue : Text, date : Text, startTime : Text, endTime : Text, booking : Booking) : Bool {
    (booking.venue == venue)
    and (booking.date == date)
    and (booking.status != #cancelled)
    and areTimesOverlapping(booking.startTime, booking.endTime, startTime, endTime);
  };

  func areTimesOverlapping(start1 : Text, end1 : Text, start2 : Text, end2 : Text) : Bool {
    let start1Int = toInt(start1);
    let end1Int = toInt(end1);
    let start2Int = toInt(start2);
    let end2Int = toInt(end2);

    (start1Int < end2Int) and (start2Int < end1Int);
  };

  func toInt(text : Text) : Int {
    switch (Int.fromText(text)) {
      case (?value) { value };
      case (null) { Runtime.trap("Cannot parse Int " # text) };
    };
  };

  func concatenateVenueTime(booking : Booking, includeVenue : Bool) : Text {
    let venueStr = if (includeVenue) { booking.venue # " -- " } else { "" };
    venueStr # booking.startTime # "-" # booking.endTime;
  };

  func calculateWarnings(venue : Text, date : Text, startTime : Text, endTime : Text) : ([SimultaneousEventWarning], ?RestGapWarning) {
    var simultaneousWarnings : [SimultaneousEventWarning] = [];
    var restGapWarning : ?RestGapWarning = null;

    for ((_, personBookings) in bookings.entries()) {
      for (booking in personBookings.values()) {
        if (booking.date == date and booking.status != #cancelled) {
          if (booking.venue != venue and areTimesOverlapping(booking.startTime, booking.endTime, startTime, endTime)) {
            let warning : SimultaneousEventWarning = {
              clubName = booking.clubName;
              eventDescription = booking.eventDescription;
              venue = booking.venue;
              contactDetails = booking.clubContact;
              startTime = booking.startTime;
              endTime = booking.endTime;
              expectedAudience = booking.expectedAudience;
            };
            simultaneousWarnings := simultaneousWarnings.concat([warning]);
          } else if (booking.venue == venue) {
            let start1Int = toInt(startTime);
            let end1Int = toInt(endTime);
            let start2Int = toInt(booking.startTime);
            let end2Int = toInt(booking.endTime);

            if (end2Int <= start1Int and start1Int - end2Int < 900) {
              restGapWarning := ?{
                conflictType = "before";
                message = "Requested booking starts within 15 minutes after previous booking in this venue";
              };
            } else if (start2Int >= end1Int and start2Int - end1Int < 900) {
              restGapWarning := ?{
                conflictType = "after";
                message = "Requested booking ends within 15 minutes before next event in this venue";
              };
            };
          };
        };
      };
    };

    (simultaneousWarnings, restGapWarning);
  };

  // Preview Booking Validation - Students can preview (read-only)
  public query ({ caller }) func previewBooking(
    clubName : Text,
    eventDescription : Text,
    clubContact : ContactDetails,
    venue : Text,
    date : Text,
    startTime : Text,
    endTime : Text,
    expectedAudience : Nat
  ) : async ?ValidationWarning {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can preview bookings");
    };
    switch (checkHardConflict(venue, date, startTime, endTime)) {
      case (?_) { null };
      case (null) {
        let (simultaneousWarnings, restGapWarning) = calculateWarnings(venue, date, startTime, endTime);
        ?{
          simultaneousEventWarnings = simultaneousWarnings;
          restGapWarning;
        };
      };
    };
  };

  // Schedule Display - Public access
  public query ({ caller }) func getTodaysSchedule(today : Text) : async [Booking] {
    bookings.values().toArray().flatten().filter(
      func(b) { b.date == today and b.status == #approved }
    ).sort(Booking.compareById);
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel bookings");
    };
    requireVerifiedBookingPermissions(caller);

    switch (bookings.get(caller)) {
      case (null) { Runtime.trap("No bookings found for caller") };
      case (?userBookings) {
        let index = findBookingIndex(userBookings, bookingId);
        switch (index) {
          case (null) { Runtime.trap("Booking does not exist or does not belong to you") };
          case (?foundIndex) {
            let booking = userBookings[foundIndex];
            if (booking.status == #cancelled) {
              Runtime.trap("Booking is already cancelled");
            } else {
              persistCancelledBooking(caller, userBookings, foundIndex);
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func cancelBookings(bookingIds : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel bookings");
    };
    requireVerifiedBookingPermissions(caller);

    for (bookingId in bookingIds.values()) {
      ignore do ? {
        let userBookings = bookings.get(caller)!;
        let index = findBookingIndex(userBookings, bookingId)!;
        let booking = userBookings[index];
        if (booking.status != #cancelled) {
          persistCancelledBooking(caller, userBookings, index);
        };
      };
    };
  };

  func findBookingIndex(bookings : [Booking], bookingId : Nat) : ?Nat {
    var index = 0;
    for (booking in bookings.values()) {
      if (booking.id == bookingId) {
        return ?index;
      };
      index += 1;
    };
    null;
  };

  func persistCancelledBooking(caller : Principal, userBookings : [Booking], index : Nat) {
    let booking = userBookings[index];
    let updatedBooking = { booking with status = #cancelled };

    let bookingsList = List.fromArray<Booking>(userBookings);
    if (index < bookingsList.size()) {
      bookingsList.put(index, updatedBooking);
      bookings.add(caller, bookingsList.toArray());
    };
  };

  public query ({ caller }) func getUserBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their bookings");
    };
    switch (bookings.get(caller)) {
      case (null) { [] };
      case (?userBookings) { userBookings };
    };
  };

  public query ({ caller }) func getUpcomingUserBookings(currentDate : Text) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their bookings");
    };
    switch (bookings.get(caller)) {
      case (null) { [] };
      case (?userBookings) {
        userBookings.filter(
          func(b) { b.date >= currentDate and b.status == #approved }
        );
      };
    };
  };

  public query ({ caller }) func getUserNotifications() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };
    [];
  };
};
