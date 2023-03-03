import { Box, Button, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function Error404() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                    }}>
                    <Typography
                        variant='h1'
                        color={isDark ? "#FFFFFF" : "#000000"}>
                        404
                    </Typography>
                    <Typography
                        variant='h6'
                        color={isDark ? "#FFFFFF" : "#000000"}>
                        La page que vous recherchez n'existe pas.
                    </Typography>
                    <Button
                        variant='contained'
                        onClick={() => navigate("/")}
                        style={{ marginTop: "10px" }}>
                        Retournez à l'accueil
                    </Button>
                </div>
                <img
                    src={
                        "https://www.boomsolutions.co.uk/wp-content/uploads/2019/11/404-error.png"
                    }
                    alt='404 Error'
                    width={400}
                />
            </div>
        </Box>
    );
}
