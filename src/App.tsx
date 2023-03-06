import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { createContext, useMemo, useState } from "react";
import "./App.scss";
import { AppRoute } from "./AppRoute";
import { Header, HeaderProps } from "./components/Header";

export const defaultImage =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/No_sign.svg/1200px-No_sign.svg.png";

export const ColorModeContext = createContext({
    toggleColorMode: () => {},
});

function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    const [mode, setMode] = useState<"light" | "dark">(
        (localStorage.getItem("theme") as "light" | "dark") ??
            (prefersDarkMode ? "dark" : "light")
    );
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                localStorage.setItem(
                    "theme",
                    mode === "light" ? "dark" : "light"
                );
                setMode((prevMode) =>
                    prevMode === "light" ? "dark" : "light"
                );
            },
        }),
        [mode]
    );

    const theme = useMemo(() => {
        return createTheme({
            ...customTheme,
            palette: {
                primary: {
                    ...customTheme.palette.primary,
                },
                secondary: {
                    ...customTheme.palette.secondary,
                },
                mode,
                background: {},
            },
        });
    }, [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <header className='no-select'>
                    <Header {...header} />
                </header>
                <div
                    className={"app"}
                    style={{
                        backgroundColor: theme.palette.background.default,
                    }}>
                    <AppRoute />
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export default App;

const customTheme = createTheme({
    palette: {
        primary: {
            contrastText: "#FFFFFF",
            main: "#a76efd",
            light: "#e4d3fe",
            dark: "#883cfc",
        },
        secondary: {
            contrastText: "#FFFFFF",
            main: "#808080",
            light: "#b3b3b3",
            dark: "#676767",
        },
    },
    shape: {
        borderRadius: 8,
    },
});

const header: HeaderProps = {
    title: { name: "CollecTwitch", action: "/" },
    buttons: [
        {
            name: "Accueil",
            action: "/",
        },
        {
            name: "Univers",
            action: "/universe",
        },
        {
            name: "Carte",
            action: "/card",
        },
    ],
};
