import { Credential } from "../../pbaas/Credential";
import {IDENTITY_CREDENTIAL_PLAINLOGIN} from "../../vdxf/keys";

const verifyCredentialSerialization = (c: Credential) => {
  const cFromBuf = new Credential();
  cFromBuf.fromBuffer(c.toBuffer());

  expect(cFromBuf.isValid()).toBe(true);
  expect(cFromBuf).toEqual(c);

  // Test JSON serialization and deserialization.
  const cJson = c.toJson();
  const cFromJson = Credential.fromJson(cJson);

  expect(cFromJson.isValid()).toBe(true);
  expect(cFromJson).toEqual(c);
};

describe('Serializes and deserializes Credential', () => {
  test('(de)serialize Credential without label', () => {
    const c = new Credential({
      version: Credential.VERSION_CURRENT,
      credentialKey: IDENTITY_CREDENTIAL_PLAINLOGIN.vdxfid,
      credential: ["myname", "mypassword"],
      scopes: ["CardUsingApplication@"],
    });

    verifyCredentialSerialization(c);
  });

  test('(de)serialize Credential with label', () => {
    const c = new Credential({
      version: Credential.VERSION_CURRENT,
      credentialKey: IDENTITY_CREDENTIAL_PLAINLOGIN.vdxfid,
      credential: ["terrible name", "terrible password 1"],
      scopes: ["MailService@", "SecondaryMailService@"],
      label: "hint: bad",
    });

    verifyCredentialSerialization(c);
  });

  test('(de)serialize Credential with JSON object credential and scopes', () => {
    const c = new Credential({
      version: Credential.VERSION_CURRENT,
      credentialKey: "iHdfNK2nkKsxWAdRYToBpDRHFU9EnJGSG4",
      credential: {
        "first": "thing",
        "second": "mypassword"
      },
      scopes: {
        "place": "Location"
      },
    });

    verifyCredentialSerialization(c);
  });

  test('(de)serialize Credential with String credential and scopes', () => {
    const c = new Credential({
      version: Credential.VERSION_CURRENT,
      credentialKey: "i67adKXncRAtgsmoZpSCRA6iba5U7SPgF4",
      credential: "cred",
      scopes: "scope@"
    });

    verifyCredentialSerialization(c);
  });

  test('create Credential from and to JSON using fromJson and toJson', () => {
    const credential = ["testuser", "testpass"];
    const scopes = ["TestService@"];
    const label = "test credential";

    const credentialJson = {
      version: Credential.VERSION_CURRENT.toNumber(),
      credentialkey: IDENTITY_CREDENTIAL_PLAINLOGIN.vdxfid,
      credential: credential,
      scopes: scopes,
      label: label,
      flags: Credential.FLAG_LABEL_PRESENT.toNumber()
    };

    const c = Credential.fromJson(credentialJson);

    // Check that the class representation matches the initial Json.
    expect(c.isValid()).toBe(true);
    expect(c.version).toStrictEqual(Credential.VERSION_CURRENT);
    expect(c.credentialKey).toBe(IDENTITY_CREDENTIAL_PLAINLOGIN.vdxfid);
    expect(c.credential).toEqual(credential);
    expect(c.scopes).toEqual(scopes);
    expect(c.label).toBe(label);
    expect(c.hasLabel()).toBe(true);

    expect(credentialJson).toStrictEqual(c.toJson());
  });

  describe('(de)serialize Credential with invalid length credential, scopes or label', () => {
    test('invalid length credential', () => {
      const c = new Credential({
        version: Credential.VERSION_CURRENT,
        credentialKey: "i67adKXncRAtgsmoZpSCRA6iba5U7SPgF4",
        credential: "a".repeat(Credential.MAX_JSON_STRING_LENGTH + 1),
        scopes: "scope@"
      });
      expect(() => {
        verifyCredentialSerialization(c);
      }).toThrow();
    });

    test('invalid length scopes', () => {
      const c = new Credential({
        version: Credential.VERSION_CURRENT,
        credentialKey: "i67adKXncRAtgsmoZpSCRA6iba5U7SPgF4",
        credential: "cred",
        scopes: "s".repeat(Credential.MAX_JSON_STRING_LENGTH + 1)
      });
      expect(() => {
        verifyCredentialSerialization(c);
      }).toThrow();
    });

    test('invalid label scopes', () => {
      const c = new Credential({
        version: Credential.VERSION_CURRENT,
        credentialKey: "i67adKXncRAtgsmoZpSCRA6iba5U7SPgF4",
        credential: "cred",
        scopes: "scope@",
        label: "l".repeat(Credential.MAX_JSON_STRING_LENGTH + 1)
      });
      expect(() => {
        verifyCredentialSerialization(c);
      }).toThrow();
    });
  });
});

describe('constructing invalid Credentials', () => {
  test('Credential with invalid version', () => {
    const c = new Credential({
      version: Credential.VERSION_INVALID,
    });

    expect(c.isValid()).toBe(false);
  });

  test('Credential with invalid length credential', () => {
    const c = new Credential({
      credential: "a".repeat(Credential.MAX_JSON_STRING_LENGTH + 1),
    });

    expect(c.isValid()).toBe(false);
  });

  test('Credential with invalid length scopes', () => {
    const c = new Credential({
      scopes: "d".repeat(Credential.MAX_JSON_STRING_LENGTH + 1),
    });

    expect(c.isValid()).toBe(false);
  });

  test('Credential with both invalid length credential and scopes', () => {
    const c = new Credential({
      credential: "a".repeat(Credential.MAX_JSON_STRING_LENGTH + 1),
      scopes: "d".repeat(Credential.MAX_JSON_STRING_LENGTH + 1),
    });

    expect(c.isValid()).toBe(false);
  });
});