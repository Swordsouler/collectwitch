import {
    CardMedia,
    CardContent,
    Typography,
    CardActions,
    Button,
    Card,
    useTheme,
    Modal,
    TextField,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Universe } from "../models";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DataStore } from "aws-amplify";
import { getCroppedImage, ImageInput } from "../components/ImageInput";
import { Storage } from "@aws-amplify/storage";
import { Crop } from "react-image-crop";
import { defaultImage } from "../App";

export function UniversePage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [universes, setUniverses] = useState<Universe[]>([]);
    const universeRef = useRef<Universe | undefined>();
    const universeName = useRef<string>();
    const universeImage = useRef<{ image: string; crop: Crop }>();

    useEffect(() => {
        const fetchUniverses = async () => {
            const universes = await DataStore.query(Universe);
            setUniverses(universes);
        };
        fetchUniverses();
        const subscription = DataStore.observe(Universe).subscribe((msg) => {
            fetchUniverses();
        });
        return () => subscription.unsubscribe();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const croppedImage = document.getElementById(
            "universe-image-cropped"
        ) as HTMLImageElement;
        if (!universeImage.current) return;
        const image = !croppedImage.src.startsWith("https://")
            ? getCroppedImage(croppedImage, universeImage.current.crop)
            : undefined;

        let universe: Universe;
        if (universeRef.current) {
            if (!image) {
                universe = await DataStore.save(
                    Universe.copyOf(universeRef.current, (updated) => {
                        updated.name = universeName.current ?? "";
                    })
                );
            } else {
                universe = universeRef.current;
            }
        } else {
            universe = await DataStore.save(
                new Universe({
                    name: universeName.current ?? "",
                })
            );
        }

        if (image) {
            const blobImage = await fetch(image).then((r) => r.blob());

            const result = await Storage.put(
                "universes/icons/" + universe.id + ".png",
                blobImage
            );

            await DataStore.save(
                Universe.copyOf(universe, (updated) => {
                    updated.name = universeName.current ?? updated.name;
                    updated.icon =
                        process.env.REACT_APP_S3_URL +
                        "public/" +
                        result.key +
                        "?t=" +
                        Date.now();
                })
            );
        }
        closeModal();
    }

    const editUniverse = (universe: Universe) => {
        universeRef.current = universe;
        universeName.current = universe.name;
        universeImage.current = universe.icon
            ? {
                  image: universe.icon,
                  crop: { height: 100, width: 100, x: 0, y: 0, unit: "px" },
              }
            : undefined;
        openModal();
    };

    const [open, setOpen] = useState(false);
    const openModal = () => setOpen(true);
    const closeModal = () => {
        universeRef.current = undefined;
        universeName.current = undefined;
        universeImage.current = undefined;
        setOpen(false);
    };
    return (
        <div className='universe__container'>
            <Card sx={{ width: 200, height: 300 }}>
                <Button
                    style={{ padding: 0, height: "100%" }}
                    variant={isDark ? "outlined" : "contained"}
                    onClick={openModal}>
                    <AddRoundedIcon style={{ height: "100%", width: "100%" }} />
                </Button>
            </Card>
            {universes.map((universe) => (
                <UniverseCard
                    universe={universe}
                    key={universe.id + universe.updatedAt}
                    editUniverse={editUniverse}
                />
            ))}

            <Modal open={open} onClose={closeModal} className='modal'>
                <div
                    className='modal__container'
                    style={{
                        backgroundColor: theme.palette.background.default,
                        borderRadius: theme.shape.borderRadius,
                        padding: theme.shape.borderRadius,
                    }}>
                    <Typography
                        variant='h6'
                        component='div'
                        color={"text.primary"}>
                        Création d'un univers
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <div className='form__content'>
                            <TextField
                                id='universe-name'
                                label="Nom de l'univers"
                                onChange={(event) => {
                                    universeName.current = event.target.value;
                                }}
                                defaultValue={universeName.current}
                                fullWidth
                            />
                            <ImageInput
                                id='universe-image'
                                aspectRatio={1}
                                label='Ajouter une image'
                                onChange={(image, crop) =>
                                    (universeImage.current = { image, crop })
                                }
                                src={universeImage.current?.image}
                            />
                        </div>
                        <div className='form__actions'>
                            <Button color='secondary' onClick={closeModal}>
                                Annuler
                            </Button>
                            <Button type='submit'>Envoyer</Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}

function UniverseCard(props: {
    universe: Universe;
    editUniverse: (universe: Universe) => void;
}) {
    const { universe, editUniverse } = props;
    const { id, name, icon } = universe;

    function deleteUniverse() {
        //remove icon from s3
        if (icon) {
            const key = icon.replace(
                process.env.REACT_APP_S3_URL + "public/",
                ""
            );
            Storage.remove(key);
        }
        DataStore.delete(Universe, id);
    }

    return (
        <Card sx={{ width: 200 }}>
            <CardMedia
                component='img'
                alt='Card'
                src={icon ?? defaultImage}
                className='no-select'
                style={{
                    width: "100%",
                    aspectRatio: 1,
                }}
            />
            <CardContent sx={{ paddingBottom: 0 }}>
                <Typography gutterBottom variant='h5' component='div'>
                    {name}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size='small' onClick={() => editUniverse(universe)}>
                    Éditer
                </Button>
                <Button size='small' onClick={deleteUniverse}>
                    Supprimer
                </Button>
            </CardActions>
        </Card>
    );
}
