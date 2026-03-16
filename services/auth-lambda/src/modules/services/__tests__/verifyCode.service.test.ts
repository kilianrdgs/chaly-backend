import { describe, it, expect, vi } from "vitest";

// 1️⃣ On mocke les modules (AVANT les imports)
vi.mock("../../repositories/verifyPhoneCode.repo", () => ({
  verifyPhoneCode: vi.fn(),
}));

vi.mock("../../repositories/getOrCreateUser.repo", () => ({
  getOrCreateUser: vi.fn(),
}));

vi.mock("../../repositories/userHasPseudo.repo", () => ({
  userHasPseudo: vi.fn(),
}));

vi.mock("../../../lib/jwt", () => ({
  generateTokenPair: vi.fn(),
}));

import { verifyCodeService } from "../verifyCode.service";
import { getOrCreateUser } from "../../repositories/getOrCreateUser.repo";
import { generateTokenPair } from "../../../lib/jwt";
import { verifyPhoneCode } from "../../repositories/verifyPhoneCode.repo";
import { userHasPseudo } from "../../repositories/userHasPseudo.repo";

describe("verifyCodeService", () => {
  it("OTP invalide -> throw une erreur", async () => {
    vi.mocked(verifyPhoneCode).mockRejectedValue(new Error("Invalid OTP"));

    vi.mocked(getOrCreateUser).mockImplementation(() => {
      throw new Error("getOrCreateUser should not be called");
    });

    await expect(verifyCodeService("+33600000000", "0000")).rejects.toThrow();

    expect(getOrCreateUser).not.toHaveBeenCalled();
    expect(generateTokenPair).not.toHaveBeenCalled();
  });

  it("nouvel utilisateur -> requiresPseudo = true", async () => {
    vi.mocked(verifyPhoneCode).mockResolvedValue(true);

    vi.mocked(getOrCreateUser).mockResolvedValue({
      user: { Id: 1, Pseudo: null } as any,
      isNewUser: true,
    });

    vi.mocked(generateTokenPair).mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    } as any);

    const result = await verifyCodeService("+33600000000", "1234");

    expect(result.isNewUser).toBe(true);
    expect(result.requiresPseudo).toBe(true);

    expect(verifyPhoneCode).toHaveBeenCalled();
    expect(getOrCreateUser).toHaveBeenCalled();
    expect(generateTokenPair).toHaveBeenCalled();
    expect(userHasPseudo).not.toHaveBeenCalled();
  });

  it("utilisateur existant -> requiresPseudo = false", async () => {
    vi.mocked(verifyPhoneCode).mockResolvedValue(true);

    vi.mocked(getOrCreateUser).mockResolvedValue({
      user: { Id: 1, Pseudo: "Kiks" } as any,
      isNewUser: false,
    });

    vi.mocked(userHasPseudo).mockResolvedValue(true);

    vi.mocked(generateTokenPair).mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    } as any);

    const result = await verifyCodeService("+33600000000", "1234");

    expect(result.isNewUser).toBe(false);
    expect(result.requiresPseudo).toBe(false);

    expect(verifyPhoneCode).toHaveBeenCalled();
    expect(getOrCreateUser).toHaveBeenCalled();
    expect(generateTokenPair).toHaveBeenCalled();
    expect(userHasPseudo).toHaveBeenCalledWith("Kiks");
  });

  it("Utilisateur existant -> requiresPseudo = true", async () => {
    vi.mocked(verifyPhoneCode).mockResolvedValue(true);

    vi.mocked(getOrCreateUser).mockResolvedValue({
      user: { Id: 1, Pseudo: "Kiks" } as any,
      isNewUser: false,
    });

    vi.mocked(userHasPseudo).mockResolvedValue(false);

    vi.mocked(generateTokenPair).mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    } as any);

    const result = await verifyCodeService("+33600000000", "1234");

    expect(result.isNewUser).toBe(false);
    expect(result.requiresPseudo).toBe(true);

    expect(verifyPhoneCode).toHaveBeenCalled();
    expect(getOrCreateUser).toHaveBeenCalled();
    expect(generateTokenPair).toHaveBeenCalled();
    expect(userHasPseudo).toHaveBeenCalledWith("Kiks");
  });
});
