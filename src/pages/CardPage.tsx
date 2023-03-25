import {
    Button,
    CardActions,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
    SelectChangeEvent,
    TablePagination,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { DataStore, Predicates, SortDirection } from "aws-amplify";
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
    const [recentCards, setRecentCards] = useState<Card[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [color1, setColor1] = useState<string>("#FF00FF");
    const [color2, setColor2] = useState<string>("#00FFFF");
    const [page, setPage] = useState<number>(0);
    const cardRef = useRef<Card | undefined>();
    const [filters, setFilters] = useState<{
        search: string;
        universeID: string;
        rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "all";
        releaseWave: number;
    }>({
        search: "",
        universeID: "all",
        rarity: "all",
        releaseWave: 0,
    });
    const [maxRows, setMaxRows] = useState<number>(10000);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
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
        releaseWave?: number;
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
        setMaxRows(10000);
        fetchCards(0, rowsPerPage, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const fetchCards = async (
        newPage?: number,
        newRowsPerPage?: number,
        filterChanged?: boolean
    ) => {
        newPage = newPage ?? page;
        newRowsPerPage = newRowsPerPage ?? rowsPerPage;
        const oldCards = cards;
        const oldPage = page;
        setRowsPerPage(newRowsPerPage);
        setCards([]);

        const currentFilters: any[] = [];
        if (filters.search) {
            currentFilters.push((c: any) =>
                c.or((c: any) => [
                    c.name.contains(filters.search ?? ""),
                    c.state.contains(filters.search ?? ""),
                ])
            );
        }
        if (filters.universeID !== "all") {
            currentFilters.push((c: any) =>
                c.universeID.eq(filters.universeID)
            );
        }
        if (filters.rarity !== "all") {
            currentFilters.push((c: any) => c.rarity.eq(filters.rarity));
        }
        if (filters.releaseWave > 0) {
            currentFilters.push((c: any) =>
                c.releaseWave.eq(filters.releaseWave)
            );
        }

        const newCards = await DataStore.query(
            Card,
            (c) => c.and((c) => currentFilters.map((f) => f(c))),
            {
                sort: (c) =>
                    c
                        .universeID(SortDirection.ASCENDING)
                        .name(SortDirection.ASCENDING)
                        .state(SortDirection.ASCENDING),
                limit: newRowsPerPage,
                page: newPage,
            }
        );

        if (newCards.length > 0) {
            setCards(newCards);
            setPage(newPage);
            if (newCards.length < newRowsPerPage) {
                setMaxRows(newRowsPerPage * newPage + newCards.length);
            }
        } else {
            if (!filterChanged) {
                setCards(oldCards);
                setPage(oldPage);
                setMaxRows(newRowsPerPage * oldPage + newRowsPerPage);
            }
        }
    };

    const fetchRecentCards = async () => {
        const newRecentCards = await DataStore.query(Card, Predicates.ALL, {
            sort: (c) => c.updatedAt(SortDirection.DESCENDING),
            limit: 14,
        });
        setRecentCards(newRecentCards);
    };

    useEffect(() => {
        fetchRecentCards();

        const subscription = DataStore.observe(Card).subscribe(() => {
            fetchRecentCards();
        });
        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        console.log(cardData.current);
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
                        updated.rarity = cardData.current.rarity ?? "COMMON";
                        updated.releaseWave = cardData.current.releaseWave ?? 0;
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
                        updated.rarity = cardData.current.rarity ?? "COMMON";
                        updated.releaseWave = cardData.current.releaseWave ?? 0;
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
                    rarity: cardData.current.rarity ?? "COMMON",
                    releaseWave: cardData.current.releaseWave ?? 0,
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
            releaseWave: card.releaseWave ?? undefined,
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
        <div className='card__page'>
            <div className='card__page__filters'>
                <div className='card__page__filter'>
                    <SelectUniverse
                        defaultValue={filters?.universeID ?? "all"}
                        onChange={(universeID) => {
                            setFilters((filters) => ({
                                ...filters,
                                universeID,
                            }));
                        }}
                        hasAll
                    />
                </div>
                <div className='card__page__filter'>
                    <SelectRarity
                        defaultValue={filters?.rarity ?? "all"}
                        onChange={(rarity) => {
                            if (
                                rarity !== "COMMON" &&
                                rarity !== "RARE" &&
                                rarity !== "EPIC" &&
                                rarity !== "LEGENDARY" &&
                                rarity !== "all"
                            )
                                return;
                            setFilters((filters) => ({
                                ...filters,
                                rarity,
                            }));
                        }}
                        hasAll
                    />
                </div>
                <TablePagination
                    component={Paper}
                    count={maxRows}
                    color='primary'
                    page={page}
                    onPageChange={(e, value) => {
                        fetchCards(value, rowsPerPage);
                    }}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        const newRowsPerPage = parseInt(event.target.value, 10);
                        fetchCards(0, newRowsPerPage);
                    }}
                    labelRowsPerPage='Carte par page :'
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} sur ${count}`
                    }
                />
                <div className='card__page__filter'>
                    <TextField
                        id='release-wave-filter'
                        label='Vague de lancement'
                        onChange={(event) => {
                            if (isNaN(parseInt(event.target.value))) return;
                            setFilters((filters) => ({
                                ...filters,
                                releaseWave: parseInt(event.target.value),
                            }));
                        }}
                        type='number'
                        defaultValue={filters?.releaseWave}
                        fullWidth
                    />
                </div>
                <div className='card__page__filter'>
                    <TextField
                        id='search-filter'
                        label='Nom ou état du personnage'
                        onChange={(event) => {
                            setFilters((filters) => ({
                                ...filters,
                                search: event.target.value,
                            }));
                        }}
                        defaultValue={filters?.search}
                        fullWidth
                    />
                </div>
            </div>
            <div className='card__page__cards'>
                <MuiCard sx={{ width: 250, height: 410 }}>
                    <Button
                        style={{ padding: 0, height: "100%" }}
                        variant={isDark ? "outlined" : "contained"}
                        onClick={openModal}>
                        <AddRoundedIcon
                            style={{ height: "100%", width: "100%" }}
                        />
                    </Button>
                </MuiCard>
                {cards.map((card) => (
                    <CardCard
                        card={card}
                        key={card.id + card.updatedAt}
                        editCard={editCard}
                    />
                ))}
            </div>

            <span
                style={{
                    width: "80%",
                    height: "2px",
                    backgroundColor: "gray",
                }}
            />

            <div className='card__page__cards'>
                {recentCards.map((card) => (
                    <CardCard
                        card={card}
                        key={card.id + card.updatedAt}
                        editCard={editCard}
                    />
                ))}
            </div>
            <Modal open={open} onClose={closeModal} className='modal'>
                <div
                    className='card__container'
                    style={{ width: "100%", maxWidth: "1100px" }}>
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
                        rarity={cardDisplay?.rarity}
                        state={cardDisplay?.state}
                        universeID={cardDisplay?.universeID}
                    />
                    <div
                        className='modal__container'
                        style={{
                            flex: 1,
                            backgroundColor: theme.palette.background.default,
                            borderRadius: theme.shape.borderRadius,
                            padding: theme.shape.borderRadius,
                            paddingRight: 0,
                        }}>
                        <Typography
                            variant='h6'
                            component='div'
                            color={"text.primary"}>
                            Création d'une carte
                        </Typography>
                        <form
                            onSubmit={handleSubmit}
                            className='card__form'
                            style={{
                                padding: theme.shape.borderRadius,
                            }}>
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

                                <SelectUniverse
                                    defaultValue={cardData.current?.universeID}
                                    onChange={(universeID) => {
                                        cardData.current.universeID =
                                            universeID;
                                    }}
                                    required
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
                                        if (rarity === "EPIC") {
                                            cardData.current.rarity =
                                                Rarity.EPIC;
                                        }
                                        if (rarity === "LEGENDARY") {
                                            cardData.current.rarity =
                                                Rarity.LEGENDARY;
                                        }
                                    }}
                                />

                                <TextField
                                    id='release-wave'
                                    label='Vague de lancement'
                                    onChange={(event) => {
                                        cardData.current.releaseWave = parseInt(
                                            event.target.value
                                        );
                                    }}
                                    type='number'
                                    defaultValue={cardData.current?.releaseWave}
                                    fullWidth
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
        <MuiCard sx={{ width: 250, overflow: "visible" }}>
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
    required?: boolean;
    hasAll?: boolean;
}) {
    const { onChange, defaultValue, required, hasAll } = props;
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
            <InputLabel id='universe-label' required={required ?? false}>
                Univers
            </InputLabel>
            <Select
                required
                labelId='universe-label'
                id='universe'
                value={universeID}
                label='Univers'
                onChange={handleChange}>
                {hasAll && <MenuItem value='all'>Tous</MenuItem>}
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
        | "all"
        | null
        | undefined;
    hasAll?: boolean;
}) {
    const { onChange, defaultValue, hasAll } = props;
    const [rarity, setRarity] = useState<string | undefined>(
        defaultValue?.toString() ?? ""
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
            <InputLabel id='rarity-label'>Rareté</InputLabel>
            <Select
                labelId='rarity-label'
                id='rarity'
                value={rarity}
                label='Rareté'
                onChange={handleChange}>
                {hasAll && <MenuItem value='all'>Tous</MenuItem>}
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
