import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const loginUser = createAsyncThunk('loginUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post('https://chat-bot-ok2h.onrender.com/user/login', userData);
    if (response.status != 201) {
      throw new Error('Login Failed');
    }
    return response.data
  } catch (error) {
    return rejectWithValue(error.message);
  }
})

export const createUser = createAsyncThunk('createUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post('https://chat-bot-ok2h.onrender.com/user/register', userData);
    if (response.status != 201) {
      throw new Error('Login Failed');
    }
    return response.data
  } catch (error) {
    return rejectWithValue(error.message);
  }
})

export const verifyToken = createAsyncThunk('verifyToken', async ({ rejectWithValue }) => {
  try {
    const token =
      localStorage.getItem("token") ||
      document.cookie
        ?.split("; ")
        .find(row => row.startsWith("token="))
        ?.split("=")[1];
    
    if (!token) throw new Error("No token found");
    const response = await axios.get(
      "https://chat-bot-ok2h.onrender.com/user/verify-token",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 3️⃣ Check and return
    if (response.status == 200){
      return response.data;
    }
    else{
      throw new Error("Invalid Token")
    }
  } catch (error) {
    return rejectWithValue(error.message);
  }
})

const initialState = {
  user: null,
  loading: false,
  isLoggedin: false,
  error: null
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedin = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // LOGIN cases
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedin = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // REGISTER cases
    builder
      .addCase(createUser.pending, (state) => { state.loading = true; })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedin = true;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  // already token exist case
    builder
      .addCase(verifyToken.pending, (state) => { state.loading = true; })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isLoggedin = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
})

export const { logout } = userSlice.actions;
export default userSlice.reducer;
