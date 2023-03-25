import { memo, useState, MouseEvent, useEffect } from "react";
import "./CardUI.scss";
import Sparkle from "../assets/sparkle.gif";
import { DataStore } from "aws-amplify";
import { Rarity, Universe } from "../models";
import { Crop } from "react-image-crop";
import { defaultImage } from "../App";
import { getCroppedImage } from "./ImageInput";
import { CircularProgress } from "@mui/material";

const CARD_ROTATION = 2;
const MAX_AMOUNT = 5;

export interface CardUIProps {
    name?: string | null;
    state?: string | null;
    cover?:
        | { image: string; crop: Crop; imageElementId: string }
        | null
        | string;
    color1?: string | null;
    color2?: string | null;
    universeID?: string;
    rarity?: string | null;
}

type Point = {
    x: number;
    y: number;
};

/* eslint no-var: off */
export const CardUI = memo(
    (props: CardUIProps) => {
        const { name, state, color1, color2, universeID, rarity } = props;
        let amount = 2;

        const [universeIcon, setUniverseIcon] = useState<string | undefined>(
            undefined
        );
        const [cover, setCover] = useState<string | undefined>(undefined);

        useEffect(() => {
            if (universeID) {
                const fetchUniverse = async () => {
                    const universe = await DataStore.query(
                        Universe,
                        universeID
                    );
                    setUniverseIcon(universe?.icon ?? "");
                };
                fetchUniverse();
            } else {
                setUniverseIcon("");
            }

            if (
                typeof props.cover === "string" ||
                props.cover?.image.startsWith("https://")
            ) {
                if (typeof props.cover === "string") {
                    setCover(props.cover);
                } else {
                    setCover(props.cover.image ?? defaultImage);
                }
            } else {
                if (props.cover?.image === "") return;

                const croppedImage = document.getElementById(
                    props.cover?.imageElementId ?? ""
                ) as HTMLImageElement;
                const image =
                    croppedImage &&
                    !croppedImage.src.startsWith("https://") &&
                    props.cover?.crop
                        ? getCroppedImage(croppedImage, props.cover?.crop)
                        : undefined;

                if (image) {
                    const src = image.substring(22);
                    const byteCharacters = atob(src);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "image/gif" });
                    var imageUrl = URL.createObjectURL(blob);
                    setCover(imageUrl);
                } else {
                    setCover("");
                }
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const [isHovered, setIsHovered] = useState<boolean>(false);
        const [cardRotation, setCardRotation] = useState<Point>({
            x: 0,
            y: 0,
        });
        const [gradientPosition, setGradientPosition] = useState<Point>({
            x: 0,
            y: 0,
        });

        function amountToValue(min: number, max: number): number {
            const a = amount > MAX_AMOUNT ? MAX_AMOUNT : amount;
            return (a * (max - min)) / MAX_AMOUNT + min;
        }

        const handleMouseEvent = (event: MouseEvent) => {
            event.preventDefault();
            if (isHovered) {
                const { clientX, clientY } = event;
                const { left, top, width, height } =
                    event.currentTarget.getBoundingClientRect();
                const x = clientX - left;
                const y = clientY - top;

                // math for mouse position
                var px = Math.abs(Math.floor((100 / width) * x) - 100);
                var py = Math.abs(Math.floor((100 / height) * y) - 100);
                // math for gradient / background positions
                var lp = 50 + (px - 50) / 1.5;
                var tp = 50 + (py - 50) / 1.5;
                var ty = ((tp - 50) / 2) * -1;
                var tx = ((lp - 50) / 1.5) * 0.5;

                setCardRotation({
                    x: tx * CARD_ROTATION,
                    y: ty * CARD_ROTATION,
                });
                setGradientPosition({
                    x: px,
                    y: py,
                });
            }
        };
        if (universeIcon === undefined || cover === undefined) {
            return (
                <div
                    style={{
                        width: "250px",
                        height: "360px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    <CircularProgress />
                </div>
            );
        }

        return (
            <div className='card-container'>
                <div
                    className={
                        "card no-select" +
                        (isHovered ? "" : " card--idle") +
                        (amount === 0 ? " gray" : "")
                    }
                    onMouseEnter={() => {
                        setIsHovered(true);
                    }}
                    onMouseLeave={() => {
                        setIsHovered(false);
                    }}
                    style={{
                        boxShadow: isHovered
                            ? `
                            -5px -5px ${amountToValue(0, 50)}px -5px ${color1}, 
                            5px 5px ${amountToValue(0, 50)}px -5px ${color2}, 
                            0 55px 35px -20px rgba(0, 0, 0, 0.5)`
                            : `-5px -5px ${amountToValue(
                                  0,
                                  15
                              )}px -5px ${color1}, 
                            5px 5px ${amountToValue(0, 25)}px -5px ${color2},
                            0 0 5px 0px rgba(255,255,255,0),
                            0 55px 35px -20px rgba(0, 0, 0, 0.5)`,
                        outline: isHovered
                            ? `4px solid ${
                                  rarityToColor[rarityToString(rarity)]
                              }`
                            : `2px solid ${
                                  rarityToColor[rarityToString(rarity)]
                              }`,
                        transform: isHovered
                            ? `rotateX(${cardRotation.y}deg) rotateY(${cardRotation.x}deg)`
                            : undefined,
                        scale: isHovered ? "1.1" : "1",
                    }}
                    onMouseMove={handleMouseEvent}>
                    <img className='card--cover' src={cover} alt='Cover' />
                    <img
                        className='card--universe'
                        src={universeIcon}
                        alt='Universe'
                    />
                    <div className='card--bottom'>
                        <span
                            className='card--name'
                            style={{
                                textShadow:
                                    "0 0 5px " +
                                    rarityToColor[rarityToString(rarity)],
                            }}>
                            {name}
                        </span>
                        <span
                            className='card--state'
                            style={{
                                textShadow:
                                    "0 0 5px " +
                                    rarityToColor[rarityToString(rarity)],
                            }}>
                            {state}
                        </span>
                    </div>
                    <div
                        className='card--amount-container'
                        style={{
                            backgroundColor:
                                rarityToColor[rarityToString(rarity)],
                        }}>
                        <span className='card--amount'>{amount}</span>
                    </div>
                    <span
                        className='card--sparkling'
                        style={{
                            backgroundImage: `url(${Sparkle}), linear-gradient(to right bottom, ${color1}, #ffffff40, ${color2})`,
                            opacity: (amount - 1) / (MAX_AMOUNT - 1),
                        }}
                    />
                    <span
                        className='card--gradient'
                        style={{
                            backgroundPosition: `${gradientPosition.x}% ${gradientPosition.y}%`,
                            backgroundImage: `
                            linear-gradient(
                                to right bottom,
                                transparent 25%,
                                ${color1} 49%,
                                ${color2} 51%,
                                transparent 75%)`,
                            opacity: isHovered
                                ? (amount - 1) / (MAX_AMOUNT - 1)
                                : 0,
                        }}
                    />
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.name === nextProps.name &&
            prevProps.state === nextProps.state &&
            prevProps.rarity === nextProps.rarity &&
            prevProps.cover === nextProps.cover &&
            prevProps.universeID === nextProps.universeID &&
            prevProps.color1 === nextProps.color1 &&
            prevProps.color2 === nextProps.color2
        );
    }
);

const rarityToColor = {
    UNDEFINED: "#888888",
    COMMON: "#00d26a",
    RARE: "#0074ba",
    EPIC: "#8d65c5",
    LEGENDARY: "#ff6723",
};

const rarityToString = (
    rarity: Rarity | string | undefined | null
): "UNDEFINED" | "COMMON" | "RARE" | "EPIC" | "LEGENDARY" => {
    if (typeof rarity === "string") {
        return rarity as "UNDEFINED" | "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
    } else if (rarity === undefined || rarity === null) {
        return "UNDEFINED";
    }
    switch (rarity) {
        case Rarity.COMMON:
            return "COMMON";
        case Rarity.RARE:
            return "RARE";
        case Rarity.EPIC:
            return "EPIC";
        case Rarity.LEGENDARY:
            return "LEGENDARY";
        default:
            return "UNDEFINED";
    }
};
