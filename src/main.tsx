import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "../src/style.css";
import store from "./store";
import router from "./routes";
import MainLoadingScreen from "./components/MainLoadingScreen";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Provider store={store}>
    <React.StrictMode>
      <Suspense fallback={<MainLoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
    </React.StrictMode>
  </Provider>
);
