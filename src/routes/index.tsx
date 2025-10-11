// src/routes/index.tsx
import { Navigate, createBrowserRouter } from "react-router-dom";
import { MAIN_PATH } from "src/constant";
import MainLayout from "src/layouts/MainLayout";
import WatchOverlay from "src/components/watch/WatchOverPlay";

// Lazy import wrappers
const HomePage = () => import("src/pages/HomePage");
const GenreExplore = () => import("src/pages/GenreExplore");
const WatchPage = () => import("src/pages/WatchPage");
// const TvPage = () => import("src/pages/TvPage");
// const MoviesPage = () => import("src/pages/MoviesPage");
// const NewPopularPage = () => import("src/pages/NewPopularPage");
// const MyListPage = () => import("src/pages/MyListPage");
// const BrowseByLanguagesPage = () => import("src/pages/BrowseByLanguagesPage");

const router = createBrowserRouter([
  {
    path: MAIN_PATH.root,
    element: <MainLayout />,
    children: [
      // Redirect "/" -> "/browse"
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
      // {
      //   path: MAIN_PATH.tv,
      //   lazy: async () => {
      //     const module = await TvPage();
      //     return { Component: module.default };
      //   },
      // },
      // {
      //   path: MAIN_PATH.movies,
      //   lazy: async () => {
      //     const module = await MoviesPage();
      //     return { Component: module.default };
      //   },
      // },
      // {
      //   path: MAIN_PATH.new,
      //   lazy: async () => {
      //     const module = await NewPopularPage();
      //     return { Component: module.default };
      //   },
      // },
      // {
      //   path: MAIN_PATH.myList,
      //   lazy: async () => {
      //     const module = await MyListPage();
      //     return { Component: module.default };
      //   },
      // },
      // {
      //   path: MAIN_PATH.languages,
      //   lazy: async () => {
      //     const module = await BrowseByLanguagesPage();
      //     return { Component: module.default };
      //   },
      // },
      {
        path: `${MAIN_PATH.genreExplore}/:genreId`,
        lazy: async () => {
          const module = await GenreExplore();
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

    ],
  },
]);

export default router;
