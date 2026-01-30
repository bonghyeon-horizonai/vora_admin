import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET is not defined in environment variables");
}

const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  adminId: string;
  email: string;
  role: string;
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // Session duration
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(
  adminId: string,
  email: string,
  role: string,
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ adminId, email, role, expiresAt });

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  (await cookies()).set("session", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
