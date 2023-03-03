import { Routes, Route } from "react-router-dom";
import { CardPage } from "./pages/CardPage";
import { Error404 } from "./pages/Error404";
import { Home } from "./pages/Home";
import { UniversePage } from "./pages/UniversePage";

export type AppRouteProps = {
    path: string;
    element: React.ReactNode;
};

export function AppRoute() {
    return (
        <Routes>
            {appRoutes.map((route) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                />
            ))}
        </Routes>
    );
}

export const appRoutes: AppRouteProps[] = [
    {
        path: "*",
        element: <Error404 />,
    },
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/universe",
        element: <UniversePage />,
    },
    {
        path: "/card",
        element: <CardPage />,
    },
];
