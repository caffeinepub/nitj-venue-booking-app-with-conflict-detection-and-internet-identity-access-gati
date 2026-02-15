import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

module {
  // Old types
  type OldProfileRole = {
    #faculty;
    #studentCoordinator;
  };

  type OldProfile = {
    email : Text;
    role : OldProfileRole;
    contactDetails : {
      name : Text;
      phone : Text;
    };
  };

  type OldActor = {
    bookings : Map.Map<Principal.Principal, [LegacyBooking]>;
    nextBookingId : Nat;
    profiles : Map.Map<Principal.Principal, OldProfile>;
  };

  type LegacyBooking = {
    id : Nat;
    clubName : Text;
    eventDescription : Text;
    clubContact : {
      name : Text;
      phone : Text;
    };
    venue : Text;
    date : Text;
    startTime : Text;
    endTime : Text;
    status : {
      #pending;
      #approved;
      #rejected;
      #cancelled;
    };
    expectedAudience : Nat;
  };

  // New types
  type NewActor = {
    bookings : Map.Map<Principal.Principal, [LegacyBooking]>;
    nextBookingId : Nat;
    profiles : Map.Map<Principal.Principal, {
      email : Text;
      role : NewProfileRole;
      verificationStatus : NewVerificationStatus;
      contactDetails : {
        name : Text;
        phone : Text;
      };
    }>;
  };

  type NewProfileRole = {
    #student;
    #studentCoordinator;
    #faculty;
  };

  type NewVerificationStatus = {
    #unverified;
    #pending;
    #verified;
  };

  public func run(old : OldActor) : NewActor {
    let newProfiles = old.profiles.map<Principal.Principal, OldProfile, {
      email : Text;
      role : NewProfileRole;
      verificationStatus : NewVerificationStatus;
      contactDetails : {
        name : Text;
        phone : Text;
      };
    }>(
      func(_p, oldProfile) {
        {
          email = oldProfile.email;
          role = matchOldRoleToNew(oldProfile.role); // Map old profile roles to new roles
          verificationStatus = if (oldProfile.role == #studentCoordinator) {
            #pending;
          } else { #verified };
          contactDetails = oldProfile.contactDetails;
        };
      }
    );

    {
      old with
      profiles = newProfiles;
    };
  };

  // Convert old profile roles to new profile role variants
  func matchOldRoleToNew(oldRole : OldProfileRole) : NewProfileRole {
    switch (oldRole) {
      case (#faculty) { #faculty };
      case (#studentCoordinator) { #studentCoordinator };
    };
  };
};
