const plugin = (() => {
  let unregisterCmd;

  return {
    onLoad: () => {
      try {
        const v = typeof vendetta !== "undefined" ? vendetta : (typeof bunny !== "undefined" ? bunny : window.vendetta || window.bunny);
        if (!v) return;

        const findByProps = v.metro?.findByProps;
        const findByStore = v.metro?.findByStore;
        const registerCommand = v.commands?.registerCommand;

        const FluxDispatcher = findByProps ? findByProps("dispatch", "subscribe") : null;
        const UserStore = findByStore ? findByStore("UserStore") : null;
        const SelectedChannelStore = findByStore ? findByStore("SelectedChannelStore") : null;

        function uniqueSnowflake() {
          return (BigInt(Date.now() - 14200704e5) << 22n).toString();
        }

        function injectFakeMessage(channelId, content) {
          if (!UserStore || !FluxDispatcher) return;
          const user = UserStore.getCurrentUser();
          if (!user) return;
          
          FluxDispatcher.dispatch({
            type: "MESSAGE_CREATE",
            channelId,
            message: {
              id: uniqueSnowflake(),
              channel_id: channelId,
              content,
              author: {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator || "0",
                avatar: user.avatar,
                global_name: user.globalName || user.username
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

        if (registerCommand) {
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
              const channelId = SelectedChannelStore ? SelectedChannelStore.getChannelId() : null;
              const content = args.find((a) => a.name === "content")?.value;
              if (channelId && content) {
                injectFakeMessage(channelId, content);
              }
            }
          });
        }
      } catch (err) {
        console.error("[FakeDM Error]:", err);
      }
    },
    onUnload: () => {
      if (unregisterCmd) unregisterCmd();
    }
  };
})();

plugin;
