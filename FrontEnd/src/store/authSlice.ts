/**
 * @file authSlice.js
 * @description Redux Toolkit slice managing authentication state — login, registration,
 * profile fetching, logout, and forced login (e.g. after password reset).
 * Uses async thunks to communicate with the auth API endpoints.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";

/**
 * Normalizes the user object returned from the API.
 * The `role` field may arrive as a nested object from the DB (e.g. { roleName: 'ADMIN' })
 * or as a plain string — this helper ensures it's always a string.
 */
const formatUser = (userData: any) => {
  if (!userData) return null;
  
  // Extract roleId. If role is populated as an object, extract from it; otherwise use userData.roleId
  const roleId = typeof userData.role === "object" && userData.role !== null ? userData.role.roleId : userData.roleId;

  return {
    ...userData,
    id: userData.userId || userData.id,
    userId: userData.userId || userData.id,
    roleId: roleId,
    role: typeof userData.role === "object" && userData.role !== null ? userData.role.roleName : userData.role
  };
};

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_: void, { rejectWithValue }: any) => {
    try {
      const response = await executeHttpGetRequest(API_PATHS.AUTH.PROFILE);
      if (response.data.success) {
        return formatUser(response.data.data);
      }
      return rejectWithValue("Failed to fetch profile");
    } catch (error) {
            // Clear stale credentials only on 401 Unauthorized
      if ((error as import('axios').AxiosError<{message?: string}>)?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return rejectWithValue(
        (error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: any, { rejectWithValue }: any) => {
    try {
      const response = await executeHttpPostRequest(API_PATHS.AUTH.LOGIN, credentials);
      if (response.data.success) {
        const {
          token,
          user: rawUser,
          requiresPasswordChange,
        } = response.data.data;
        const formattedUser = formatUser(rawUser);

        // If a password change is required (e.g. first-time login), return early
        // without persisting the token — the UI will prompt the user first
        if (requiresPasswordChange) {
          return { requiresPasswordChange, token, user: formattedUser };
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(formattedUser));
        return { user: formattedUser, token };
      }
      return rejectWithValue("Login failed");
    } catch (error) {
            return rejectWithValue(
        (error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "An error occurred during login",
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: any, { rejectWithValue }: any) => {
    try {
      const response = await executeHttpPostRequest(API_PATHS.AUTH.REGISTER, userData);
      if (response.data.success) {
        const { token, user: rawUser } = response.data.data;
        const formattedUser = formatUser(rawUser);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(formattedUser));
        return { user: formattedUser, token };
      }
      return rejectWithValue("Registration failed");
    } catch (error) {
            return rejectWithValue(
        (error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "An error occurred during registration",
      );
    }
  },
);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: true, // Starts true so the UI shows a loader until fetchProfile resolves
  error: null,
  requiresPasswordChange: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state: any) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.clear();
    },
    clearError: (state: any) => {
      state.error = null;
    },
    setIsLoading: (state: any, action: any) => {
      state.loading = action.payload;
    },
    /** Used after a forced password change to finalize login without re-authenticating */
    forceLogin: (state: any, action: any) => {
      const { user, token } = action.payload;
      state.user = formatUser(user);
      state.token = token;
      state.requiresPasswordChange = false;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  extraReducers: (builder: any) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state: any, action: any) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state: any) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      // Login User
      .addCase(loginUser.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state: any, action: any) => {
        state.loading = false;
        if (action.payload.requiresPasswordChange) {
          state.requiresPasswordChange = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.requiresPasswordChange = false;
        }
      })
      .addCase(loginUser.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register User
      .addCase(registerUser.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state: any, action: any) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state: any, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setIsLoading, forceLogin } = authSlice.actions;

export default authSlice.reducer;
