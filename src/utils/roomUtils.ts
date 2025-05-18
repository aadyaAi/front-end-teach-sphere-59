
/**
 * Generates a random room ID
 * @returns A random string to be used as room ID
 */
export const generateRoomId = (): string => {
  // Generate a random string of 10 characters
  const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
};
