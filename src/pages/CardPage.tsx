import {
    Button,
    CardActions,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { DataStore } from "aws-amplify";
import { Card, Rarity, Universe } from "../models";
import { Storage } from "@aws-amplify/storage";
import { CardUI } from "../components/CardUI";
import { Card as MuiCard } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { getCroppedImage, ImageInput } from "../components/ImageInput";
import { Crop } from "react-image-crop";
import { MuiColorInput } from "mui-color-input";

export function CardPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [cards, setCards] = useState<Card[]>([]);
    const [color1, setColor1] = useState<string>("#FF00FF");
    const [color2, setColor2] = useState<string>("#00FFFF");
    const cardRef = useRef<Card | undefined>();
    const cardData = useRef<{
        name?: string;
        state?: string;
        color1?: string;
        color2?: string;
        cover?: { image: string; crop: Crop };
        universeID?: string;
        rarity?:
            | Rarity
            | "COMMON"
            | "RARE"
            | "EPIC"
            | "LEGENDARY"
            | "EXCLUSIVE"
            | null
            | undefined;
    }>({});
    const [cardDisplay, setCardDisplay] = useState<{
        name?: string;
        state?: string;
        color1?: string;
        color2?: string;
        cover?: { image: string; crop: Crop };
        universeID?: string;
        rarity?:
            | Rarity
            | "COMMON"
            | "RARE"
            | "EPIC"
            | "LEGENDARY"
            | "EXCLUSIVE"
            | null
            | undefined;
    }>();

    useEffect(() => {
        const fetchCards = async () => {
            const cards = await DataStore.query(Card);
            setCards(cards);
        };
        fetchCards();
        const subscription = DataStore.observe(Card).subscribe((msg) => {
            fetchCards();
        });
        return () => subscription.unsubscribe();
    }, []);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const croppedImage = document.getElementById(
            "card-cover-cropped"
        ) as HTMLImageElement;
        const image =
            croppedImage &&
            !croppedImage.src.startsWith("https://") &&
            cardData.current.cover
                ? getCroppedImage(croppedImage, cardData.current.cover.crop)
                : undefined;

        let card: Card;
        if (cardRef.current) {
            if (!image) {
                card = await DataStore.save(
                    Card.copyOf(cardRef.current, (updated) => {
                        updated.name = cardData.current.name ?? "";
                        updated.state = cardData.current.state ?? "";
                        updated.color1 = cardData.current.color1;
                        updated.color2 = cardData.current.color2;
                        updated.universeID = cardData.current.universeID ?? "";
                        updated.rarity = cardData.current.rarity;
                    })
                );
            } else {
                const blobImage = await fetch(image).then((r) => r.blob());
                const key = `cards/cover/${cardRef.current.id}.png`;
                await Storage.put(key, blobImage, {
                    contentType: "image/png",
                });
                card = await DataStore.save(
                    Card.copyOf(cardRef.current, (updated) => {
                        updated.name = cardData.current.name ?? "";
                        updated.state = cardData.current.state ?? "";
                        updated.color1 = cardData.current.color1;
                        updated.color2 = cardData.current.color2;
                        updated.cover =
                            process.env.REACT_APP_S3_URL +
                            "public/" +
                            key +
                            "?t=" +
                            Date.now();
                        updated.universeID = cardData.current.universeID ?? "";
                        updated.rarity = cardData.current.rarity;
                    })
                );
            }
        } else {
            card = await DataStore.save(
                new Card({
                    name: cardData.current.name ?? "",
                    state: cardData.current.state ?? "",
                    color1: cardData.current.color1,
                    color2: cardData.current.color2,
                    universeID: cardData.current.universeID ?? "",
                    rarity: cardData.current.rarity,
                    releaseWave: 1,
                    available: true,
                })
            );
            if (image) {
                const blobImage = await fetch(image).then((r) => r.blob());
                const key = `cards/cover/${card.id}.png`;
                await Storage.put(key, blobImage, {
                    contentType: "image/png",
                });
                await DataStore.save(
                    Card.copyOf(card, (updated) => {
                        updated.cover =
                            process.env.REACT_APP_S3_URL +
                            "public/" +
                            key +
                            "?t=" +
                            Date.now();
                    })
                );
            }
        }
        closeModal();
    }

    const editCard = (card: Card) => {
        cardRef.current = card;
        cardData.current = {
            name: card.name,
            state: card.state,
            color1: card.color1 ?? undefined,
            color2: card.color2 ?? undefined,
            cover: card.cover
                ? {
                      image: card.cover,
                      crop: { height: 100, width: 100, x: 0, y: 0, unit: "px" },
                  }
                : undefined,
            universeID: card.universeID,
            rarity: card.rarity ?? undefined,
        };
        setColor1(card.color1 ?? "#FFFF00");
        setColor2(card.color2 ?? "#00FFFF");
        openModal();
        generateCard();
    };

    const [open, setOpen] = useState(false);
    const openModal = () => setOpen(true);
    const closeModal = () => {
        cardRef.current = undefined;
        cardData.current = {};
        setCardDisplay({});
        setColor1("#FFFF00");
        setColor2("#00FFFF");
        setOpen(false);
    };

    const generateCard = () => {
        setCardDisplay({
            name: cardData.current?.name,
            state: cardData.current?.state,
            color1: cardData.current?.color1,
            color2: cardData.current?.color2,
            cover: cardData.current?.cover,
            universeID: cardData.current?.universeID,
            rarity: cardData.current?.rarity,
        });
    };

    return (
        <div className='universe__container'>
            <MuiCard sx={{ width: 250, height: 410 }}>
                <Button
                    style={{ padding: 0, height: "100%" }}
                    variant={isDark ? "outlined" : "contained"}
                    onClick={openModal}>
                    <AddRoundedIcon style={{ height: "100%", width: "100%" }} />
                </Button>
            </MuiCard>
            {cards.map((card) => (
                <CardCard
                    card={card}
                    key={card.id + card.updatedAt}
                    editCard={editCard}
                />
            ))}

            <Modal open={open} onClose={closeModal} className='modal'>
                <div className='card__container'>
                    <CardUI
                        key={
                            (cardDisplay?.name ?? "") +
                            cardDisplay?.color1 +
                            cardDisplay?.color2 +
                            cardDisplay?.cover?.image +
                            JSON.stringify(cardDisplay?.cover?.crop) +
                            cardDisplay?.state +
                            cardDisplay?.universeID
                        }
                        name={cardDisplay?.name}
                        color1={cardDisplay?.color1}
                        color2={cardDisplay?.color2}
                        cover={{
                            image: cardDisplay?.cover?.image ?? "",
                            crop: cardDisplay?.cover?.crop ?? {
                                height: 100,
                                width: 100,
                                x: 0,
                                y: 0,
                                unit: "px",
                            },
                            imageElementId: "card-cover-cropped",
                        }}
                        state={cardDisplay?.state}
                        universeID={cardDisplay?.universeID}
                    />
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
                            Création d'une carte
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <div className='form__content'>
                                <TextField
                                    id='card-name'
                                    label='Nom du personnage'
                                    onChange={(event) => {
                                        cardData.current.name =
                                            event.target.value;
                                    }}
                                    defaultValue={cardData.current?.name}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    id='card-state'
                                    label='État du personnage'
                                    onChange={(event) => {
                                        cardData.current.state =
                                            event.target.value;
                                    }}
                                    defaultValue={cardData.current?.state}
                                    fullWidth
                                />
                                <ImageInput
                                    id='card-cover'
                                    aspectRatio={200 / 280}
                                    label='Ajouter une image'
                                    onChange={(image, crop) => {
                                        cardData.current.cover = {
                                            image,
                                            crop,
                                        };
                                    }}
                                    src={cardData.current?.cover?.image}
                                />

                                <MuiColorInput
                                    fullWidth
                                    color='primary'
                                    label='Couleur 1'
                                    value={color1 ?? "#FFFF00"}
                                    onChange={(color) => {
                                        setColor1(color);
                                        cardData.current.color1 = color;
                                    }}
                                />

                                <MuiColorInput
                                    fullWidth
                                    color='primary'
                                    label='Couleur 2'
                                    value={color2 ?? "#00FFFF"}
                                    onChange={(color) => {
                                        setColor2(color);
                                        cardData.current.color2 = color;
                                    }}
                                />

                                <SelectUniverse
                                    defaultValue={cardData.current?.universeID}
                                    onChange={(universeID) => {
                                        cardData.current.universeID =
                                            universeID;
                                    }}
                                />

                                <SelectRarity
                                    defaultValue={cardData.current?.rarity}
                                    onChange={(rarity) => {
                                        //convert string to Rarity
                                        if (rarity === "COMMON") {
                                            cardData.current.rarity =
                                                Rarity.COMMON;
                                        }
                                        if (rarity === "RARE") {
                                            cardData.current.rarity =
                                                Rarity.RARE;
                                        }
                                        if (rarity === "RARE") {
                                            cardData.current.rarity =
                                                Rarity.RARE;
                                        }
                                        if (rarity === "LEGENDARY") {
                                            cardData.current.rarity =
                                                Rarity.LEGENDARY;
                                        }
                                    }}
                                />
                            </div>
                            <div className='form__actions'>
                                <Button color='secondary' onClick={closeModal}>
                                    Annuler
                                </Button>
                                <Button onClick={generateCard}>Générer</Button>
                                <Button type='submit'>Envoyer</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function CardCard(props: { card: Card; editCard: (card: Card) => void }) {
    const { card, editCard } = props;
    const { id, name, cover, color1, color2 } = card;

    function deleteCard() {
        //remove icon from s3
        if (cover) {
            const key = cover
                .replace(process.env.REACT_APP_S3_URL + "public/", "")
                .split("?")[0];
            Storage.remove(key);
        }
        DataStore.delete(Card, id);
    }

    return (
        <MuiCard sx={{ width: 250 }}>
            <CardUI {...card} key={id + name + cover + color1 + color2} />
            <CardActions>
                <Button size='small' onClick={() => editCard(card)}>
                    Éditer
                </Button>
                <Button size='small' onClick={deleteCard}>
                    Supprimer
                </Button>
            </CardActions>
        </MuiCard>
    );
}

function SelectUniverse(props: {
    onChange: (universeID: string) => void;
    defaultValue?: string;
}) {
    const { onChange, defaultValue } = props;
    const [universeID, setUniverseID] = useState<string>(defaultValue ?? "");
    const [universes, setUniverses] = useState<Universe[]>([]);

    useEffect(() => {
        //fetch universes
        const fetchUniverses = async () => {
            const universes = await DataStore.query(Universe);
            setUniverses(universes);
        };
        fetchUniverses();
    }, []);

    const handleChange = (
        event: SelectChangeEvent<string>,
        child: React.ReactNode
    ) => {
        setUniverseID(event.target.value);
        onChange(event.target.value);
    };
    if (universes.length === 0) return null;

    return (
        <FormControl fullWidth>
            <InputLabel id='universe-label' required>
                Univers
            </InputLabel>
            <Select
                required
                labelId='universe-label'
                id='universe'
                value={universeID}
                label='Univers'
                onChange={handleChange}>
                {universes.map((universe) => {
                    return (
                        <MenuItem value={universe.id} key={universe.id}>
                            {universe.name}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}

function SelectRarity(props: {
    onChange: (rarity: string) => void;
    defaultValue?:
        | Rarity
        | "COMMON"
        | "RARE"
        | "EPIC"
        | "LEGENDARY"
        | "EXCLUSIVE"
        | null
        | undefined;
}) {
    const { onChange, defaultValue } = props;
    const [rarity, setRarity] = useState<string | undefined>(
        defaultValue?.toString() ?? "COMMON"
    );
    const rarities = [
        {
            id: Rarity.COMMON,
            name: "Commun",
        },
        {
            id: Rarity.RARE,
            name: "Rare",
        },
        {
            id: Rarity.EPIC,
            name: "Épique",
        },
        {
            id: Rarity.LEGENDARY,
            name: "Légendaire",
        },
    ];

    const handleChange = (
        event: SelectChangeEvent<string>,
        child: React.ReactNode
    ) => {
        setRarity(event.target.value);
        onChange(event.target.value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel id='rarity-label' required>
                Rareté
            </InputLabel>
            <Select
                required
                labelId='rarity-label'
                id='rarity'
                value={rarity}
                label='Rareté'
                onChange={handleChange}>
                {rarities.map((rarity) => {
                    return (
                        <MenuItem value={rarity.id} key={rarity.id}>
                            {rarity.name}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
