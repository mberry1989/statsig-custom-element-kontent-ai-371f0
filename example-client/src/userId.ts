const USER_ID_KEY = "statsig_user_id";

export const getUserId = (): string => {
  const existingId = localStorage.getItem(USER_ID_KEY);

  if (existingId) {
    return existingId;
  }

  const newId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  localStorage.setItem(USER_ID_KEY, newId);

  return newId;
};
