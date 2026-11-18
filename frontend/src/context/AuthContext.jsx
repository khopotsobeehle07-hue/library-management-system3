import { createContext, useCallback, useContext, useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { ROLE_PERMISSIONS } from "../data/roles";
import { api } from "../api";

const AuthContext = createContext(null);

export const MEMBERSHIP_PREFIXES = {
  admin: "ADMIN",
  librarian: "LIB",
  member: "MEM",
};

export function isValidMembershipId(role, membershipId) {
  const prefix = MEMBERSHIP_PREFIXES[role];
  return Boolean(prefix && new RegExp(`^${prefix}\\d{3,}$`, "i").test(membershipId));
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [currentUser, setCurrentUser] = useLocalStorage("currentUser", null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      const loadedUsers = await api.get("/users");
      setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);
    } catch (err) {
      setUsersError(err.message || "Unable to reach the backend.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadUsers);
  }, [loadUsers]);

  const assignableRoles = ROLE_PERMISSIONS[currentUser?.role] ?? [];
  const canManage = (role) => assignableRoles.includes(role);

  const login = (name, membershipId) => {
    if (typeof name !== "string" || typeof membershipId !== "string") return false;
    const normalizedName = name.trim().toLowerCase();
    const normalizedMembershipId = membershipId.trim().toLowerCase();
    const found = users.find(
      (u) =>
        typeof u?.name === "string" &&
        typeof u?.membershipId === "string" &&
        u.name.toLowerCase() === normalizedName &&
        u.membershipId.toLowerCase() === normalizedMembershipId
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addUser = async (user) => {
    if (!canManage(user.role)) return "You are not allowed to add this role.";
    if (!isValidMembershipId(user.role, user.membershipId)) {
      return `Membership ID must start with ${MEMBERSHIP_PREFIXES[user.role]}001.`;
    }
    try {
      await api.post("/users", { ...user, membershipId: user.membershipId.trim().toUpperCase() });
      await loadUsers();
      return null;
    } catch (err) {
      return err.message || "Unable to add user.";
    }
  };

  const updateUser = async (id, updates) => {
    const target = users.find((u) => u.id === id);
    if (!target) return "User not found.";
    const mergedUpdates = { ...target, ...(updates || {}) };
    if (currentUser && currentUser.id === id && mergedUpdates.role !== target.role) {
      return "You cannot change your own role.";
    }
    if (!canManage(target.role) || !canManage(mergedUpdates.role)) {
      return "You are not allowed to change this user.";
    }
    if (!isValidMembershipId(mergedUpdates.role, mergedUpdates.membershipId)) {
      return `Membership ID must start with ${MEMBERSHIP_PREFIXES[mergedUpdates.role]}001.`;
    }
    const normalizedUpdates = {
      name: typeof mergedUpdates.name === "string" ? mergedUpdates.name.trim() : "",
      membershipId:
        typeof mergedUpdates.membershipId === "string"
          ? mergedUpdates.membershipId.trim().toUpperCase()
          : "",
      role: mergedUpdates.role,
    };
    try {
      await api.put(`/users/${id}`, normalizedUpdates);
      await loadUsers();
      if (currentUser && currentUser.id === id) {
        setCurrentUser({ ...currentUser, ...normalizedUpdates });
      }
      return null;
    } catch (err) {
      return err.message || "Unable to update user.";
    }
  };

  const deleteUser = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target || id === currentUser?.id || !canManage(target.role)) {
      return "You are not allowed to delete this user.";
    }
    try {
      await api.remove(`/users/${id}`);
      await loadUsers();
      return null;
    } catch (err) {
      return err.message || "Unable to delete user.";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        loadingUsers,
        usersError,
        currentUser,
        assignableRoles,
        canManage,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}