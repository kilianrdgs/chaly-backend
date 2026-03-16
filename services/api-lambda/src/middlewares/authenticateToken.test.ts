import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/tokens", () => ({
  verifyToken: vi.fn(),
}));

import { verifyToken } from "../utils/tokens";
import { authenticateToken } from "./authenticateToken";
import { HttpError, StatusCode } from "../globals/http";

const mockReq = (auth?: string) =>
  ({
    headers: auth ? { authorization: auth } : {},
  } as any);

const mockRes = () =>
  ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    locals: {},
  } as any);

describe("Middleware authenticateToken", () => {
  it("reject sans token", () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCode.Unauthorized);
    expect(res.json).toHaveBeenCalledWith({ error: "TOKEN_INVALID" });
    expect(next).not.toHaveBeenCalled();
  });

  it("reject token expiré", () => {
    const req = mockReq("Bearer expired");
    const res = mockRes();
    const next = vi.fn();

    vi.mocked(verifyToken).mockImplementation(() => {
      throw new HttpError(401, "TOKEN_EXPIRED");
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCode.Unauthorized);
    expect(res.json).toHaveBeenCalledWith({ error: "TOKEN_EXPIRED" });
    expect(next).not.toHaveBeenCalled();
  });

  it("token valide -> next appelé", () => {
    const req = mockReq("Bearer valid");
    const res = mockRes();
    const next = vi.fn();

    vi.mocked(verifyToken).mockReturnValue({
      tokenType: "access",
      sub: "10",
      jti: "id",
    });

    authenticateToken(req, res, next);

    expect(res.locals.userId).toBe(10);
    expect(next).toHaveBeenCalled();
  });
});
