import React from "react";
import { useRef } from "react";

const tmi = require("tmi.js");

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
                //if message === "*c" then send message saying "@username Désolé, je suis pas encore prêt mon bro"
                if (message === "*c") {
                    twitch.current.say(
                        channel,
                        `@${tags.username} Désolé, je suis pas encore prêt mon bro`
                    );
                }
            }
        );
    };

    React.useEffect(() => {
        connectTwitch("crysthallive");
    }, []);

    return <div></div>;
}
