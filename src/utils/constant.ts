import { join } from 'path';

export const COOKIE_AUTH_NAME = 'nest_login';
export const SECURE_COOKIE_OPTION = {
  httpOnly: true,
  secure: true,
  signed: true,
};
export const PUBLIC_FOLDER = 'public';
export const MAIN_PATH = join(__dirname, '../../../');
export const PUBLIC_PATH = join(MAIN_PATH, PUBLIC_FOLDER);
export const IMAGE_FOLDER = 'images';

export const Kb = 1000;
export const Mb = 1000 * Kb;

//images prefixes:
export enum FilePrefix {
  empty = '',
  user = 'user-',
}
//keys
export const IS_PUBLIC_KEY = 'IS_PUBLIC';
export const CHECK_POLICIES_KEY = 'CHECK_POLICY';
