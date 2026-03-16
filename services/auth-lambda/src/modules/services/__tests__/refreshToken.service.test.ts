import { describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/isRefreshTokenValid.repo", () => ({
  isRefreshTokenValid: vi.fn(),
}));

vi.mock("../../../lib/jwt", () => ({
  verifyToken: vi.fn(),
  generateTokenPair: vi.fn(),
}));

vi.mock("../../repositories/invalidateRefreshToken.repo", () => ({
  invalidateRefreshToken: vi.fn(),
}));

const accessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJqdGkiOiIyZTYwNzQ0Mi04MTdiLTQ5ODItYmI3ZC0yOGM4Y2ZiNzYwZTUiLCJzdWIiOiIxMCIsImlhdCI6MTc2NjIwMjc4NSwiZXhwIjoxNzY2MjAzNjg1fQ.VvqZwhSEljbwLtBnwEy_QzS3M7cPuCXGaDNUEg7bPpI";

import { isRefreshTokenValid } from "../../repositories/isRefreshTokenValid.repo";
import { generateTokenPair, verifyToken } from "../../../lib/jwt";
import { invalidateRefreshToken } from "../../repositories/invalidateRefreshToken.repo";
import { refreshTokenService } from "../refreshToken.service";

describe("refreshTokenService", () => {
  it("refreshToken invalide -> stop immédiat", async () => {
    vi.mocked(isRefreshTokenValid).mockResolvedValue(false);

    await expect(refreshTokenService("bad_token")).rejects.toMatchObject({
      code: "TOKEN_INVALID",
      statusCode: 401,
    });

    expect(verifyToken).not.toBeCalled();
    expect(invalidateRefreshToken).not.toBeCalled();
    expect(generateTokenPair).not.toBeCalled();
  });

  it("TokenType -> !== 'refresh' ", async () => {
    vi.mocked(isRefreshTokenValid).mockResolvedValue(true);

    vi.mocked(verifyToken).mockReturnValue({
      tokenType: "access",
      sub: "10",
      jti: "id",
    } as any);

    await expect(refreshTokenService("access_token")).rejects.toMatchObject({
      code: "TOKEN_INVALID",
      statusCode: 401,
    });

    expect(invalidateRefreshToken).not.toBeCalled();
    expect(generateTokenPair).not.toBeCalled();
  });

  it("userId invalide dans le sub du refresh -> reject", async () => {
    vi.mocked(isRefreshTokenValid).mockResolvedValue(true);

    vi.mocked(verifyToken).mockReturnValue({
      tokenType: "refresh",
      sub: "abc",
      jti: "id",
    } as any);

    await expect(refreshTokenService("refresh_token")).rejects.toMatchObject({
      code: "TOKEN_INVALID",
      statusCode: 401,
    });

    expect(invalidateRefreshToken).not.toBeCalled();
    expect(generateTokenPair).not.toBeCalled();
  });

  it("échec de l'invalidation de l'ancien refresh -> refresh ok quand même", async () => {
    vi.mocked(isRefreshTokenValid).mockResolvedValue(true);

    vi.mocked(verifyToken).mockReturnValue({
      tokenType: "refresh",
      sub: "10",
      jti: "id",
    } as any);

    vi.mocked(invalidateRefreshToken).mockRejectedValue(
      new Error("Erreur invalidateRefreshToken.repo")
    );

    vi.mocked(generateTokenPair).mockReturnValue({
      accessToken: "new_access",
      refreshToken: "new_refresh",
    } as any);

    const result = await refreshTokenService("refresh_token");

    expect(generateTokenPair).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      accessToken: "new_access",
      refreshToken: "new_refresh",
    });
  });

  it("refreshToken valide -> retourne une nouvelle paire", async () => {
    vi.mocked(isRefreshTokenValid).mockResolvedValue(true);

    vi.mocked(verifyToken).mockReturnValue({
      tokenType: "refresh",
      sub: "10",
      jti: "id",
    } as any);

    vi.mocked(generateTokenPair).mockReturnValue({
      accessToken: "new_access",
      refreshToken: "new_refresh",
    } as any);

    const tokens = await refreshTokenService("refresh_token");

    expect(tokens.accessToken).toBe("new_access");
  });
});
