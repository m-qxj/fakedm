import { React } from "@vendetta/metro/common";
import { findByStore, findByProps } from "@vendetta/metro";
import { registerCommand } from "@vendetta/commands";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const UserStore = findByStore("UserStore");
const SelectedChannelStore = findByStore("SelectedChannelStore");

let _idCounter = 0;
function uniqueSnowflake(date = new Date()) {
    const offset = _idCounter++ % 4096;
    const ms = Math.max(0, date.getTime() - 1420070400000);
    return ((BigInt(ms) << 22n) | BigInt(offset)).toString();
}

function injectFakeMessage(channelId, content) {
    const user = UserStore.getCurrentUser();
    if (!user) return;
    const id = uniqueSnowflake();

    FluxDispatcher.dispatch({
        type: "MESSAGE_CREATE",
        channelId,
        message: {
            id,
            channel_id: channelId,
            content,
            author: {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator || "0",
                avatar: user.avatar,
                global_name: user.globalName || user.username,
            },
            timestamp: new Date().toISOString(),
            attachments: [],
            embeds: [],
            mentions: [],
            pinned: false,
            type: 0
        },
        optimistic: false,
        isPushNotification: false
    });
}

let unregisterCmd;

export default {
    onLoad: () => {
        unregisterCmd = registerCommand({
            name: "fakedm",
            displayName: "fakedm",
            description: "Inject a fake message into current channel",
            displayDescription: "Inject a fake message into current channel",
            options: [
                {
                    name: "content",
                    description: "Message content",
                    type: 3,
                    required: true
                }
            ],
            execute: (args) => {
                const channelId = SelectedChannelStore.getChannelId();
                const content = args.find(a => a.name === "content")?.value;
                if (channelId && content) {
                    injectFakeMessage(channelId, content);
                }
            }
        });
    },
    onUnload: () => {
        if (unregisterCmd) unregisterCmd();
    }
};

