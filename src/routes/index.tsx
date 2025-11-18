import { Navigate, createBrowserRouter } from "react-router-dom";
import { MAIN_PATH } from "src/constant";
import MainLayout from "src/layouts/MainLayout";

import AuthPage from "src/pages/AuthPage";
import SignUpPage from "src/pages/SignUpPage";
import UserInfoPage from "src/pages/UserInfoPage";

const HomePage = () => import("src/pages/HomePage");
const GenrePage = () => import("src/pages/GenrePage");
const WatchPage = () => import("src/pages/WatchPage");
const CountryPage = () => import("src/pages/CountryPage");
const FeatureFilmsPage = () => import("src/pages/FeatureFilmsPage");
const SeriesPage = () => import("src/pages/SeriesPage");
const FavoritesPage = () => import("src/pages/FavoritesPage");
const WatchListPage = () => import("src/pages/WatchListPage");

const router = createBrowserRouter([
  {
    path: MAIN_PATH.root,
    element: <MainLayout />,
    children: [
      { 
        index: true, 
        element: <Navigate to={`/${MAIN_PATH.browse}`} replace />
      },

      {
        path: "sign-in/*",
        element: <AuthPage />,
      },

      {
        path: "sign-up/*",
        element: <SignUpPage />,
      },

      {
        path: "account/*",
        element: <UserInfoPage />,
      },
      // Protected routes
      {
        path: MAIN_PATH.favorites,
        lazy: async () => {
          const module = await FavoritesPage();
          return { Component: module.default };
        },
      },
      {
        path: MAIN_PATH.watchlist,
        lazy: async () => {
          const module = await WatchListPage();
          return { Component: module.default };
        },
      },
      {
        path: MAIN_PATH.browse,
        lazy: async () => {
          const module = await HomePage();
          return { Component: module.default };
        },
      },

      {
        path: MAIN_PATH.featurefilm,
        lazy: async () => {
          const module = await FeatureFilmsPage();
          return { Component: module.default };
        },
      },

      {
        path: MAIN_PATH.series,
        lazy: async () => {
          const module = await SeriesPage();
          return { Component: module.default };
        },
      },

      {
        path: `${MAIN_PATH.genre}/:slug`,
        lazy: async () => {
          const module = await GenrePage();
          return { Component: module.default };
        },
      },

      {
        path: `${MAIN_PATH.watch}/:slug`,
        lazy: async () => {
          const module = await WatchPage();
          return { Component: module.default };
        },
      },

      {
        path: `${MAIN_PATH.country}/:slug`,
        lazy: async () => {
          const module = await CountryPage();
          return { Component: module.default };
        },
      },
    ],
  },
]);

export default router;