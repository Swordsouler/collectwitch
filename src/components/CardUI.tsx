import { CircularProgress } from "@mui/material";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { Crop } from "react-image-crop";
import { defaultImage } from "../App";
import { Universe } from "../models";
import { getCroppedImage } from "./ImageInput";

export function CardUI(props: {
    name?: string | null;
    state?: string | null;
    cover?:
        | { image: string; crop: Crop; imageElementId: string }
        | null
        | string;
    color1?: string | null;
    color2?: string | null;
    universeID?: string;
}) {
    const { name, state, color1, color2, universeID } = props;
    const [universeIcon, setUniverseIcon] = useState<string | undefined>(
        undefined
    );
    const [cover, setCover] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (universeID) {
            const fetchUniverse = async () => {
                const universe = await DataStore.query(Universe, universeID);
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
    const amount = "0";
    let url = window.location.origin + "/card-ui/";
    url = url + "?image_card=" + (cover ?? defaultImage);
    url =
        url +
        "&image_universe=" +
        encodeURIComponent(universeIcon ?? defaultImage);
    url = url + "&color1=" + encodeURIComponent(color1 ?? "#00FFFF");
    url = url + "&color2=" + encodeURIComponent(color2 ?? "#FF00FF");
    url = url + "&name=" + encodeURIComponent(name ?? "Nom");
    url = url + "&state=" + encodeURIComponent(state ?? "Normal");
    url = url + "&amount=" + encodeURIComponent(amount ?? "0");

    return (
        <iframe
            title='Card'
            src={url}
            width='250'
            height='360'
            frameBorder={0}
        />
    );
}
