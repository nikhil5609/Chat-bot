import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getHistory = createAsyncThunk('get-history',async (userId , { rejectWithValue }) => {
    try {
        const res = await axios.post('http://localhost:8000/get-history',{
            userid: userId
        })
        if(res.status !== 200){
            throw new Error("Cant Fetch History");
        }
        return res.data
    } catch (error) {
        return rejectWithValue(error.message);
    }
})

const initialState = {
    activeSession: null,
    history : [],
    error: null,
    loading: false
}

export const modelSlice = createSlice({
    name: 'model',
    initialState,
    reducers: {
        setactiveSession : (state,action) => {
            state.activeSession = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
              .addCase(getHistory.pending, (state) => {
                state.loading = true;
            })
              .addCase(getHistory.fulfilled, (state, action) => {
                state.history = action.payload.history;
                state.loading = false;
              })
              .addCase(getHistory.rejected, (state, action) => {
                state.history = [];
                state.error = action.payload;
                state.loading = false;
              });
    }
})

export const { setactiveSession  } = modelSlice.actions;
export default modelSlice.reducer;