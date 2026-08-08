var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.tsx
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_metro = require("@vendetta/metro");
var import_commands = require("@vendetta/commands");
var FluxDispatcher = (0, import_metro.findByProps)("dispatch", "subscribe");
var UserStore = (0, import_metro.findByStore)("UserStore");
var SelectedChannelStore = (0, import_metro.findByStore)("SelectedChannelStore");
var _idCounter = 0;
function uniqueSnowflake(date = /* @__PURE__ */ new Date()) {
  const offset = _idCounter++ % 4096;
  const ms = Math.max(0, date.getTime() - 14200704e5);
  return (BigInt(ms) << 22n | BigInt(offset)).toString();
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
        global_name: user.globalName || user.username
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
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
var unregisterCmd;
var index_default = {
  onLoad: () => {
    unregisterCmd = (0, import_commands.registerCommand)({
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
        const content = args.find((a) => a.name === "content")?.value;
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
