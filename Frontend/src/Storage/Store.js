import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice'
import modelReducer from "./modelSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        model: modelReducer
    }
})