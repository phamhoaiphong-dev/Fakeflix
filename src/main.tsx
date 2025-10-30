// src/main.tsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react"; 
import "../src/style.css";
import store from "./store";
import router from "./routes";
import MainLoadingScreen from "./components/MainLoadingScreen";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to .env");
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <Provider store={store}>
      <React.StrictMode>
        <Suspense fallback={<MainLoadingScreen />}>
          <RouterProvider router={router} />
        </Suspense>
      </React.StrictMode>
    </Provider>
  </ClerkProvider>
);