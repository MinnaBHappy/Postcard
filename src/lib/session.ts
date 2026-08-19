export type UserName = "MIN" | "MOMOKA";

const STORAGE_KEY = "postcard:currentUser";

export function getCurrentUser(): UserName | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "MIN" || value === "MOMOKA" ? value : null;
}

export function setCurrentUser(user: UserName) {
  window.localStorage.setItem(STORAGE_KEY, user);
}

export function getOtherUser(user: UserName): UserName {
  return user === "MIN" ? "MOMOKA" : "MIN";
}
