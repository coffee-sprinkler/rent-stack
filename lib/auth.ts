import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export function signToken(payload: {
  userId: string;
  role: string;
  organizationId?: string;
  name?: string;
}) {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as {
    userId: string;
    role: string;
    organizationId?: string;
    name?: string;
  };
