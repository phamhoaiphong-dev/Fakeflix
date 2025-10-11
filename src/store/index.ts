import { configureStore } from "@reduxjs/toolkit";
import { kkphimApi } from "src/store/slices/kkphim";
import discoverReducer from "./slices/discover";

const store = configureStore({
  reducer: {
    discover: discoverReducer,
    [kkphimApi.reducerPath]: kkphimApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(kkphimApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
