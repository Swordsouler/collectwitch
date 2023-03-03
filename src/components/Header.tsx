import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Link, useLocation } from "react-router-dom";
import { Tabs, Tab, Menu, MenuItem, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../App";

export type HeaderProps = {
    window?: () => Window;
    title?: HeaderButtonProps;
    buttons?: HeaderButtonProps[];
};

const drawerWidth = 240;

function GetActiveTab(buttons: HeaderButtonProps[], pathname: string) {
    pathname =
        pathname.length > 1 && pathname.endsWith("/")
            ? pathname.slice(0, -1)
            : pathname;
    const activeTab = buttons.findIndex((button) => {
        if (typeof button.action === "string") {
            return button.action === pathname;
        } else if (typeof button.action === "object") {
            return button.action.find((child) => {
                return child.action === pathname;
            });
        }
        return false;
    });
    return activeTab === -1 ? 0 : activeTab;
}

export function Header(props: HeaderProps) {
    const theme = useTheme();
    const { window, title, buttons = [] } = props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const colorMode = useContext(ColorModeContext);
    const { pathname } = useLocation();
    const [activeTab, setActiveTab] = useState(GetActiveTab(buttons, pathname));

    useEffect(() => {
        setActiveTab(GetActiveTab(buttons, pathname));
    }, [pathname, buttons]);

    function onClickButton(action?: HeaderButtonAction) {
        if (typeof action === "string") return;
        if (!action) {
            alert("No route found");
            return;
        }
        if (typeof action === "function") {
            action();
        }
    }

    if (!title || !buttons || buttons.length === 0) return null;

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box
            onClick={handleDrawerToggle}
            sx={{
                textAlign: "center",
                backgroundColor:
                    theme.palette.mode === "dark"
                        ? undefined
                        : theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                height: "100%",
            }}>
            <Typography variant='h6' sx={{ my: 2 }}>
                <BetterLink action={title.action}>{title.name}</BetterLink>
            </Typography>
            <Divider
                style={{ backgroundColor: theme.palette.primary.contrastText }}
                variant='middle'
            />
            <List>
                {buttons.map((button) => {
                    if (typeof button.action === "object") {
                        return (
                            <div key={button.name}>
                                {button.action.map((child) => (
                                    <BetterLink
                                        key={child.name}
                                        action={child.action}>
                                        <ListItem disablePadding>
                                            <ListItemButton
                                                sx={{ textAlign: "center" }}
                                                onClick={() =>
                                                    onClickButton(child.action)
                                                }>
                                                <ListItemText
                                                    primary={child.name}
                                                    className={
                                                        child.action ===
                                                        pathname
                                                            ? "underline"
                                                            : ""
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    </BetterLink>
                                ))}
                            </div>
                        );
                    } else {
                        return (
                            <BetterLink
                                key={button.name}
                                action={button.action}>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        sx={{ textAlign: "center" }}
                                        onClick={() =>
                                            onClickButton(button.action)
                                        }>
                                        <ListItemText
                                            primary={button.name}
                                            className={
                                                button.action === pathname
                                                    ? "underline"
                                                    : ""
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </BetterLink>
                        );
                    }
                })}
            </List>
        </Box>
    );

    const container =
        window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar component='nav'>
                <Toolbar style={{ height: "50px", minHeight: "50px" }}>
                    <IconButton
                        color='inherit'
                        aria-label='open drawer'
                        edge='start'
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: "none" } }}>
                        <MenuRoundedIcon />
                    </IconButton>
                    <Typography
                        variant='h4'
                        component='div'
                        sx={{
                            flexGrow: 1,
                            display: "block",
                            cursor: "pointer",
                        }}
                        onClick={() => onClickButton(title.action)}>
                        <BetterLink action={title.action}>
                            {title.name}
                        </BetterLink>
                    </Typography>
                    <Box
                        sx={{
                            display: { xs: "none", md: "block" },
                        }}
                        style={{ height: "100%" }}>
                        <Tabs
                            value={activeTab}
                            variant='standard'
                            TabIndicatorProps={{
                                style: {
                                    background: "white",
                                    height: "3px",
                                },
                            }}
                            style={{ height: "100%", alignItems: "center" }}>
                            {buttons.map((button, id) => {
                                return (
                                    <HeaderTab
                                        key={"tab-" + id + "-" + button.name}
                                        button={button}
                                        onClickButton={onClickButton}
                                    />
                                );
                            })}
                        </Tabs>
                    </Box>
                    <IconButton
                        onClick={colorMode.toggleColorMode}
                        color='inherit'
                        aria-label='open drawer'
                        edge='start'
                        sx={{ ml: 2 }}>
                        {theme.palette.mode === "dark" ? (
                            <Brightness7Icon />
                        ) : (
                            <Brightness4Icon />
                        )}
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box component='nav'>
                <Drawer
                    container={container}
                    variant='temporary'
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                        },
                    }}>
                    {drawer}
                </Drawer>
            </Box>
        </Box>
    );
}

function HeaderTab(props: {
    button: HeaderButtonProps;
    onClickButton: (action?: HeaderButtonAction) => void;
}) {
    const theme = useTheme();
    const { button, onClickButton } = props;
    const hasChildren =
        typeof button.action !== "function" &&
        typeof button.action !== "string";

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Link
            to={typeof button.action === "string" ? button.action : "#"}
            style={{ textDecoration: "none" }}>
            <Tab
                key={button.name}
                label={
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}>
                        {button.name}
                        {hasChildren && <KeyboardArrowDownRoundedIcon />}
                    </span>
                }
                onClick={(event) => {
                    if (hasChildren) handleClick(event);
                    else onClickButton(button.action);
                }}
                style={{
                    color: "white",
                    height: "50px",
                    padding: "10px",
                    opacity: 1,
                }}
            />
            {hasChildren && (
                <Menu
                    id='header__menu'
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    style={{
                        marginTop: "3px",
                        padding: 0,
                    }}
                    MenuListProps={{
                        style: {
                            padding: 0,
                        },
                    }}>
                    {typeof button.action === "object" &&
                        button.action?.map((child, id) => (
                            <BetterLink
                                key={"link-" + id + "-" + child.name}
                                action={child.action}>
                                <MenuItem
                                    onClick={() => {
                                        onClickButton(child.action);
                                        handleClose();
                                    }}
                                    style={{
                                        backgroundColor:
                                            theme.palette.mode === "light"
                                                ? theme.palette.primary.main
                                                : undefined,
                                        color: theme.palette.primary
                                            .contrastText,
                                    }}>
                                    {child.name}
                                </MenuItem>
                            </BetterLink>
                        ))}
                </Menu>
            )}
        </Link>
    );
}

function BetterLink(props: {
    children: React.ReactNode;
    action?: HeaderButtonAction;
}) {
    const { children, action } = props;
    if (
        typeof action === "string" &&
        action.toString().length > 0 &&
        action[0] !== "/"
    ) {
        return (
            <a
                href={action}
                style={{ textDecoration: "none", color: "inherit" }}
                onClick={() => {
                    if (typeof action === "string")
                        window.open(action, "_blank");
                }}>
                {children}
            </a>
        );
    } else {
        return (
            <Link
                to={typeof action === "string" ? action : "#"}
                style={{ textDecoration: "none", color: "inherit" }}>
                {children}
            </Link>
        );
    }
}

export type HeaderButtonAction = string | (() => void) | HeaderButtonProps[];

export type HeaderButtonProps = {
    name: string;
    action?: HeaderButtonAction;
};
