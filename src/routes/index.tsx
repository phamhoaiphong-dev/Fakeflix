import { Navigate, createBrowserRouter } from "react-router-dom";
import { MAIN_PATH } from "src/constant";
import MainLayout from "src/layouts/MainLayout";

const HomePage = () => import("src/pages/HomePage");
const GenrePage = () => import("src/pages/GenrePage");
const WatchPage = () => import("src/pages/WatchPage");
const CountryPage = () => import("src/pages/CountryPage");
const FeatureFilmsPage = () => import("src/pages/FeatureFilmsPage");
const SeriesPage = () => import("src/pages/SeriesPage");
const AuthPage = () => import("src/pages/AuthPage");

const router = createBrowserRouter([
  {
    path: "/sign-in",
    lazy: async () => {
      const module = await AuthPage();
      return { Component: module.default };
    },
  },
  {
    path: "/sign-up",
    lazy: async () => {
      const module = await AuthPage();
      return { Component: module.default };
    },
  },
  {
    path: MAIN_PATH.root,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={`/${MAIN_PATH.browse}`} replace />,
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
