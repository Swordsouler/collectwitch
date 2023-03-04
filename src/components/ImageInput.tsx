import { useTheme } from "@mui/material";
import { useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";

export function ImageInput(props: {
    id: string;
    aspectRatio: number;
    src?: string;
    label: string;
    onChange: (image: string, crop: Crop) => void;
    defaultImage?: string;
}) {
    const { id, aspectRatio, label, onChange } = props;
    const [src, setSrc] = useState<string>(props.src ?? "");
    const isLocaleImage = props.src !== undefined && props.src === src;
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const src = reader.result as string;
            const crop: Crop = {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                unit: "px",
            };
            onChange(src, crop);
            setSrc(src);
        });
        reader.readAsDataURL(file);
    };

    const theme = useTheme();
    const mainColor = theme.palette.primary.main;

    return (
        <div
            className='image-input__container no-select'
            style={{ color: mainColor, borderColor: mainColor }}>
            <label htmlFor={id} className='image-input__area'>
                {label}
            </label>
            <input
                style={{ display: "none" }}
                id={id}
                type='file'
                accept='image/*'
                multiple={false}
                onChange={handleFileChange}
            />
            {isLocaleImage ? (
                <img
                    src={src}
                    id={id + "-cropped"}
                    alt='Input'
                    className='image-input__image-cropped'
                />
            ) : src ? (
                <Cropper
                    id={id}
                    src={src}
                    aspectRatio={aspectRatio}
                    onChange={onChange}
                />
            ) : null}
        </div>
    );
}

function Cropper(props: {
    id: string;
    src: string;
    aspectRatio: number;
    onChange: (image: string, crop: Crop) => void;
}) {
    const { src, aspectRatio, onChange, id } = props;
    const [crop, setCrop] = useState<Crop>({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        unit: "px",
    });

    return (
        <ReactCrop
            crop={crop}
            onChange={(c) => {
                setCrop(c);
                onChange(src, c);
            }}
            aspect={aspectRatio}>
            <img
                src={src}
                id={id + "-cropped"}
                alt='Input'
                className='image-input__image-cropped'
            />
        </ReactCrop>
    );
}

export function getCroppedImage(image: HTMLImageElement, crop: Crop) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    if (ctx) {
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );
    }
    // Converting to base64
    const base64Image = canvas.toDataURL("image/png");
    return base64Image;
}
