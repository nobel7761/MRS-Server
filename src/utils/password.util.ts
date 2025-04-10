import { compareSync, hashSync } from 'bcrypt';

export const hashPassword = (password: string) => {
  const encrypted = hashSync(password, Number(process.env.BCRYPT_SALT_ROUNDS));
  return encrypted;
};

export const comparePassword = (dbPassword: string, loginPassword: string) => {
  const isPasswordValid = compareSync(loginPassword, dbPassword);
  return isPasswordValid;
};
