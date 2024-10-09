"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityVdxfidMap = exports.getFriendlyNameForVdxfKey = void 0;
const identitykeys = require("../vdxf/identitydatakeys");
const keylist = require("../vdxf/keys");
const IMPLEMENTED_LOCALES = ['EN'];
const getFriendlyNameForVdxfKey = (vdxfkey, locale = 'EN') => {
    if (!IMPLEMENTED_LOCALES.includes(locale)) {
        throw new Error(locale + " is not implemented");
    }
    if (vdxfkey in exports.IdentityVdxfidMap[locale]) {
        return exports.IdentityVdxfidMap[vdxfkey][locale];
    }
    else {
        throw new Error("Unknown VDXF key");
    }
};
exports.getFriendlyNameForVdxfKey = getFriendlyNameForVdxfKey;
exports.IdentityVdxfidMap = {
    [identitykeys.IDENTITY_FIRSTNAME.vdxfid]: { EN: "First Name" },
    [identitykeys.IDENTITY_LASTNAME.vdxfid]: { EN: "Last Name" },
    [identitykeys.IDENTITY_NATIONALITY.vdxfid]: { EN: "Nationality" },
    [identitykeys.IDENTITY_ATTESTOR.vdxfid]: { EN: "Attestor ID" },
    [identitykeys.IDENTITY_ATTESTATION_RECIPIENT.vdxfid]: { EN: "Attestation Recipient" },
    [identitykeys.IDENTITY_PHONENUMBER.vdxfid]: { EN: "Phone Number" },
    [identitykeys.IDENTITY_DATEOFBIRTH.vdxfid]: { EN: "Date of Birth" },
    [identitykeys.IDENTITY_OVER18.vdxfid]: { EN: "Over 18" },
    [identitykeys.IDENTITY_OVER21.vdxfid]: { EN: "Over 21" },
    [identitykeys.IDENTITY_OVER25.vdxfid]: { EN: "Over 25" },
    [identitykeys.IDENTITY_EMAIL.vdxfid]: { EN: "Email Address" },
    [identitykeys.IDENTITY_HOMEADDRESS.vdxfid]: { EN: "Home address" },
    [identitykeys.IDENTITY_HOMEADDRESS_STREET1.vdxfid]: { EN: "Street 1" },
    [identitykeys.IDENTITY_HOMEADDRESS_STREET2.vdxfid]: { EN: "Street 2" },
    [identitykeys.IDENTITY_HOMEADDRESS_CITY.vdxfid]: { EN: "City" },
    [identitykeys.IDENTITY_HOMEADDRESS_REGION.vdxfid]: { EN: "Region" },
    [identitykeys.IDENTITY_HOMEADDRESS_POSTCODE.vdxfid]: { EN: "Post Code" },
    [identitykeys.IDENTITY_HOMEADDRESS_COUNTRY.vdxfid]: { EN: "Country" },
    [identitykeys.IDENTITY_IDNUMBER_VALUE.vdxfid]: { EN: "ID Number" },
    [identitykeys.IDENTITY_IDNUMBER_TYPE.vdxfid]: { EN: "ID Type" },
    [identitykeys.IDENTITY_VERIFICATION_STATUS.vdxfid]: { EN: "Verification Status" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_ACCEPTEDTOS.vdxfid]: { EN: "Accepted Terms and Conditions" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_VERIFIEDSMS.vdxfid]: { EN: "SMS Verified" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_KYCCHECKED.vdxfid]: { EN: "KYC Checked ok" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_DOCUMENTSVERIFIED.vdxfid]: { EN: "Documents Verified" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_SELFIECHECKED.vdxfid]: { EN: "Selfie Checked" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_WATCHLISTOK.vdxfid]: { EN: "Watchlist ok" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_RISKCHECKOK.vdxfid]: { EN: "Riskcheck ok" },
    [identitykeys.IDENTITY_DRIVINGLICENCE.vdxfid]: { EN: "Driving Licence" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ORIGINALFRONT.vdxfid]: { EN: "Driving Licence Front" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ORIGINALBACK.vdxfid]: { EN: "Driving Licence Back" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_CROPPEDFRONT.vdxfid]: { EN: "Driving Licence Front" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_CROPPEDBACK.vdxfid]: { EN: "Driving Licence Back" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_FACE.vdxfid]: { EN: "Driving Licence Face" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_IDNUMBER.vdxfid]: { EN: "Driving Licence Number" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_CATEGORY.vdxfid]: { EN: "Driving Licence Catagory" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_EXPIRATIONDATE.vdxfid]: { EN: "Driving Licence expiry date" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ISSUINGCOUNTRY.vdxfid]: { EN: "Driving Licence issuing country" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ISSUINGREGION.vdxfid]: { EN: "Driving Licence issuing region" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_DATEOFBIRTH.vdxfid]: { EN: "Driving Licence Date of Birth" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_STREET1.vdxfid]: { EN: "Driving Licence Street 1" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_CITY.vdxfid]: { EN: "Driving Licence City" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_REGION.vdxfid]: { EN: "Driving Licence Region" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_POSTCODE.vdxfid]: { EN: "Driving Licence ZIP/Post Code" },
    [identitykeys.IDENTITY_DRIVINGLICENCE_ADDRESS_COUNTRY.vdxfid]: { EN: "Driving Licence Country" },
    [identitykeys.IDENTITY_SELFIECHECK_IMAGE.vdxfid]: { EN: "Selfie Check image" },
    [identitykeys.IDENTITY_SELFIECHECK_VIDEO.vdxfid]: { EN: "Selfie Check video" },
    [identitykeys.IDENTITY_VERIFICATION_APPROVALS_RISKCHECKOK.vdxfid]: { EN: "Risk Check Ok" },
    [identitykeys.IDENTITY_EMAIL_ISDELIVERABLE.vdxfid]: { EN: "Email address is deliverable" },
    [identitykeys.IDENTITY_EMAIL_BREACHCOUNT.vdxfid]: { EN: "Email breach count" },
    [identitykeys.IDENTITY_EMAIL_FIRSTBREACHEDAT.vdxfid]: { EN: "Email first breach date" },
    [identitykeys.IDENTITY_EMAIL_LASTBREACHEDAT.vdxfid]: { EN: "Email last breach date" },
    [identitykeys.IDENTITY_EMAIL_DOMAIN_REGISTEREDAT.vdxfid]: { EN: "Email domain registered at" },
    [identitykeys.IDENTITY_EMAIL_DOMAIN_FREEPROVIDER.vdxfid]: { EN: "Email is free provider" },
    [identitykeys.IDENTITY_EMAIL_DOMAIN_CUSTOM.vdxfid]: { EN: "Email Domain is custom" },
    [identitykeys.IDENTITY_EMAIL_DOMAIN_DISPOSABLE.vdxfid]: { EN: "Email Domain Disposable" },
    [identitykeys.IDENTITY_EMAIL_DOMAIN_TOPLEVEL_SUSPICIOUS.vdxfid]: { EN: "Email top level Domain Suspicious" },
    [identitykeys.IDENTITY_IDCARD.vdxfid]: { EN: "ID Card" },
    [identitykeys.IDENTITY_IDCARD_ORIGINALFRONT.vdxfid]: { EN: "ID Card Front" },
    [identitykeys.IDENTITY_IDCARD_ORIGINALBACK.vdxfid]: { EN: "ID Card Back" },
    [identitykeys.IDENTITY_IDCARD_CROPPEDFRONT.vdxfid]: { EN: "ID Card Front" },
    [identitykeys.IDENTITY_IDCARD_CROPPEDBACK.vdxfid]: { EN: "ID Card Back" },
    [identitykeys.IDENTITY_IDCARD_FACE.vdxfid]: { EN: "ID Card Face" },
    [identitykeys.IDENTITY_IDCARD_IDNUMBER.vdxfid]: { EN: "ID Card ID Number" },
    [identitykeys.IDENTITY_IDCARD_CATEGORY.vdxfid]: { EN: "ID Card Category" },
    [identitykeys.IDENTITY_IDCARD_EXPIRATIONDATE.vdxfid]: { EN: "ID Card Expiry date" },
    [identitykeys.IDENTITY_IDCARD_ISSUINGREGION.vdxfid]: { EN: "ID Card Issuing Region" },
    [identitykeys.IDENTITY_IDCARD_DATEOFBIRTH.vdxfid]: { EN: "ID Card Date of Birth" },
    [identitykeys.IDENTITY_IDCARD_ADDRESS_STREET1.vdxfid]: { EN: "ID Card Street 1" },
    [identitykeys.IDENTITY_IDCARD_ADDRESS_CITY.vdxfid]: { EN: "ID Card City" },
    [identitykeys.IDENTITY_IDCARD_ADDRESS_REGION.vdxfid]: { EN: "ID Card Region" },
    [identitykeys.IDENTITY_IDCARD_ADDRESS_POSTCODE.vdxfid]: { EN: "ID Card Zip/Post Code" },
    [identitykeys.IDENTITY_IDCARD_ADDRESS_COUNTRY.vdxfid]: { EN: "ID Card Country" },
    [identitykeys.IDENTITY_PASSPORT.vdxfid]: { EN: "Passport" },
    [identitykeys.IDENTITY_PASSPORT_ORIGINALFRONT.vdxfid]: { EN: "Passport front" },
    [identitykeys.IDENTITY_PASSPORT_ORIGINALBACK.vdxfid]: { EN: "Passport back" },
    [identitykeys.IDENTITY_PASSPORT_CROPPEDFRONT.vdxfid]: { EN: "Passport front" },
    [identitykeys.IDENTITY_PASSPORT_CROPPEDBACK.vdxfid]: { EN: "Passport back" },
    [identitykeys.IDENTITY_PASSPORT_FACE.vdxfid]: { EN: "Passport face" },
    [identitykeys.IDENTITY_PASSPORT_IDNUMBER.vdxfid]: { EN: "Passport ID Number" },
    [identitykeys.IDENTITY_PASSPORT_CATEGORY.vdxfid]: { EN: "Passport Category" },
    [identitykeys.IDENTITY_PASSPORT_EXPIRATIONDATE.vdxfid]: { EN: "Passport expiry date" },
    [identitykeys.IDENTITY_PASSPORT_DATEOFBIRTH.vdxfid]: { EN: "Passport date of birth" },
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_STREET1.vdxfid]: { EN: "Passport street 1" },
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_CITY.vdxfid]: { EN: "Passport city" },
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_REGION.vdxfid]: { EN: "Passport region" },
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_POSTCODE.vdxfid]: { EN: "Passport zip/post code" },
    [identitykeys.IDENTITY_PASSPORT_ADDRESS_COUNTRY.vdxfid]: { EN: "Passport country" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT.vdxfid]: { EN: "Residence Permit" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ORIGINALFRONT.vdxfid]: { EN: "Residence Permit front" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ORIGINALBACK.vdxfid]: { EN: "Residence Permit back" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_CROPPEDFRONT.vdxfid]: { EN: "Residence Permit front" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_CROPPEDBACK.vdxfid]: { EN: "Residence Permit back" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_FACE.vdxfid]: { EN: "Residence Permit face" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_IDNUMBER.vdxfid]: { EN: "Residence Permit ID Number" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_CATEGORY.vdxfid]: { EN: "Residence Permit category" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_EXPIRATIONDATE.vdxfid]: { EN: "Residence Permit expiry date" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ISSUINGREGION.vdxfid]: { EN: "Residence Permit issuing region" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_DATEOFBIRTH.vdxfid]: { EN: "Residence Permit date of birth" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS.vdxfid]: { EN: "Residence Permit Address" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_STREET1.vdxfid]: { EN: "Residence Permit Street 1" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_CITY.vdxfid]: { EN: "Residence Permit City" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_REGION.vdxfid]: { EN: "Residence Permit Region" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_POSTCODE.vdxfid]: { EN: "Residence Permit Zip/Post code" },
    [identitykeys.IDENTITY_RESIDENCEPERMIT_ADDRESS_COUNTRY.vdxfid]: { EN: "Residence Permit Country" },
    [identitykeys.IDENTITY_RESIDENTCARD.vdxfid]: { EN: "Resident Card" },
    [identitykeys.IDENTITY_RESIDENTCARD_ORIGINALFRONT.vdxfid]: { EN: "Resident Card Front" },
    [identitykeys.IDENTITY_RESIDENTCARD_ORIGINALBACK.vdxfid]: { EN: "Resident Card Back" },
    [identitykeys.IDENTITY_RESIDENTCARD_CROPPEDFRONT.vdxfid]: { EN: "Resident Card Front" },
    [identitykeys.IDENTITY_RESIDENTCARD_CROPPEDBACK.vdxfid]: { EN: "Resident Card Back" },
    [identitykeys.IDENTITY_RESIDENTCARD_FACE.vdxfid]: { EN: "Resident Card Face" },
    [identitykeys.IDENTITY_RESIDENTCARD_IDNUMBER.vdxfid]: { EN: "Resident Card ID Number" },
    [identitykeys.IDENTITY_RESIDENTCARD_CATEGORY.vdxfid]: { EN: "Resident Card Category" },
    [identitykeys.IDENTITY_RESIDENTCARD_EXPIRATIONDATE.vdxfid]: { EN: "Resident Card Expiry Date" },
    [identitykeys.IDENTITY_RESIDENTCARD_ISSUINGREGION.vdxfid]: { EN: "Resident Card Issuing Region" },
    [identitykeys.IDENTITY_RESIDENTCARD_DATEOFBIRTH.vdxfid]: { EN: "Resident Card date of birth" },
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_STREET1.vdxfid]: { EN: "Resident Card Street 1" },
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_CITY.vdxfid]: { EN: "Resident Card City" },
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_REGION.vdxfid]: { EN: "Resident Card Region" },
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_POSTCODE.vdxfid]: { EN: "Resident Card Zip/Post Code" },
    [identitykeys.IDENTITY_RESIDENTCARD_ADDRESS_COUNTRY.vdxfid]: { EN: "Resident Card Country" },
    [identitykeys.IDENTITY_VISA.vdxfid]: { EN: "Visa" },
    [identitykeys.IDENTITY_VISA_ORIGINALFRONT.vdxfid]: { EN: "Visa front" },
    [identitykeys.IDENTITY_VISA_ORIGINALBACK.vdxfid]: { EN: "Visa back" },
    [identitykeys.IDENTITY_VISA_CROPPEDFRONT.vdxfid]: { EN: "Visa front" },
    [identitykeys.IDENTITY_VISA_CROPPEDBACK.vdxfid]: { EN: "Visa back" },
    [identitykeys.IDENTITY_VISA_FACE.vdxfid]: { EN: "Visa face" },
    [identitykeys.IDENTITY_VISA_IDNUMBER.vdxfid]: { EN: "Visa ID Number" },
    [identitykeys.IDENTITY_VISA_CATEGORY.vdxfid]: { EN: "Visa Category" },
    [identitykeys.IDENTITY_VISA_EXPIRATIONDATE.vdxfid]: { EN: "Visa expiry date" },
    [identitykeys.IDENTITY_VISA_ISSUINGREGION.vdxfid]: { EN: "Visa issuing region" },
    [identitykeys.IDENTITY_VISA_DATEOFBIRTH.vdxfid]: { EN: "Visa date of birth" },
    [identitykeys.IDENTITY_VISA_ADDRESS_STREET1.vdxfid]: { EN: "Visa Street 1" },
    [identitykeys.IDENTITY_VISA_ADDRESS_CITY.vdxfid]: { EN: "Visa City" },
    [identitykeys.IDENTITY_VISA_ADDRESS_REGION.vdxfid]: { EN: "Visa Region" },
    [identitykeys.IDENTITY_VISA_ADDRESS_POSTCODE.vdxfid]: { EN: "Visa Zip/Post Code" },
    [identitykeys.IDENTITY_VISA_ADDRESS_COUNTRY.vdxfid]: { EN: "Visa Country" },
    [keylist.ATTESTATION_PROVISION_TYPE.vdxfid]: { EN: "Attestation Type" },
    [keylist.ATTESTATION_PROVISION_URL.vdxfid]: { EN: "Attestation URL" },
    [keylist.ATTESTATION_VIEW_RESPONSE.vdxfid]: { EN: "Attestation View Response" },
    [keylist.ATTESTATION_VIEW_REQUEST.vdxfid]: { EN: "Attestation View Response" },
    [keylist.PROFILE_DATA_VIEW_REQUEST.vdxfid]: { EN: "Profile Data View Request" },
    [keylist.IDENTITY_SIGNDATA_REQUEST.vdxfid]: { EN: "Identity Sign Data Request" }
};
