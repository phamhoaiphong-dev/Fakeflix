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
import { Toaster } from "react-hot-toast";

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
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                background: "rgba(25,25,25,0.95)",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 16px",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(255,255,255,0.1)",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </Suspense>
      </React.StrictMode>
    </Provider>
  </ClerkProvider>
);