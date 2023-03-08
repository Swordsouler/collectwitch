import { DataStore } from "aws-amplify";
import React from "react";
import { useRef } from "react";
import { Card, Rarity } from "../models";

const tmi = require("tmi.js");
const cards: {
    COMMON: Card[];
    RARE: Card[];
    EPIC: Card[];
    LEGENDARY: Card[];
} = {
    COMMON: [],
    RARE: [],
    EPIC: [],
    LEGENDARY: [],
};

export function Bot() {
    const twitch = useRef<any>();

    const connectTwitch = (channelName: string) => {
        twitch.current = new tmi.client({
            channels: [channelName],
            options: { debug: true },
            connection: {
                reconnect: true,
                secure: true,
            },
            identity: {
                username: process.env.REACT_APP_TWITCH_BOT_USERNAME,
                password: process.env.REACT_APP_TWITCH_BOT_PASSWORD,
            },
        });
        twitch.current.connect();
        twitch.current.on(
            "message",
            (channel: any, tags: any, message: string, self: any) => {
                console.log(tags);
                if (message === "*c") {
                    const randomCard =
                        cards.COMMON[
                            Math.floor(Math.random() * cards.COMMON.length)
                        ];
                    twitch.current.say(
                        channel,
                        `@${tags.username} ${randomCard.name}`
                    );
                    twitch.current.say("crysthallive", `${randomCard.name}`);
                }
            }
        );
    };

    React.useEffect(() => {
        connectTwitch("crysthallive");

        const loadCards = async () => {
            cards.COMMON = await DataStore.query(
                Card,
                (c) => c.releaseWave.eq(1) && c.rarity.eq(Rarity.COMMON)
            );
            cards.RARE = await DataStore.query(
                Card,
                (c) => c.releaseWave.eq(1) && c.rarity.eq(Rarity.RARE)
            );
            cards.EPIC = await DataStore.query(
                Card,
                (c) => c.releaseWave.eq(1) && c.rarity.eq(Rarity.EPIC)
            );
            cards.LEGENDARY = await DataStore.query(
                Card,
                (c) => c.releaseWave.eq(1) && c.rarity.eq(Rarity.LEGENDARY)
            );
            // write the name of the card in the chat
        };
        loadCards();
    }, []);

    return <div></div>;
}
