require("dotenv/config");
const { default: axios } = require("axios");

async function getApiStatus() {
    try {
        const response = await axios.all([
            axios.get("https://game-status-api.ubisoft.com/v1/instances?appIds=e3d5ea9e-50bd-43b7-88bf-39794f4e3d40"),
            axios.get("https://game-status-api.ubisoft.com/v1/instances?spaceIds=57e580a1-6383-4506-9509-10a390b7e2f1,05bfb3f7-6c21-4c42-be1f-97a33fb5cf66,96c1d424-057e-4ff7-860b-6b9c9222bdbf,98a601e5-ca91-4440-b1c5-753f601a2c90,631d8095-c443-4e21-b301-4af1a0929c27")
        ]).then(axios.spread(async (pcStatus, consolesStatus) => {
            // if (pcStatus.status != 200 || consolesStatus.status != 200 ||)
            pcStatus = pcStatus.data[0];
            consolesStatus = consolesStatus.data;
            consolesStatus.unshift(pcStatus);
            return await consolesStatus;
        }));
        return response;
    } catch (error) {
        return null;
    }
}

async function statusFormat(status) {
    let data;
    if (status && status.Status) {
        const online = status.Status === "Online";
        const platform = status.Platform === "PC";
        data = {
            name: status.Platform,
            value: online ? "🟢 En ligne" : "🔴 Maintenance",
            inline: !platform
        };
    } else {
        data = {
            name: "Information non récupérable",
            value: "❓"
        };
    }
    return data;
}

async function patchWebhook() {
    const response = await getApiStatus();
    // console.log(response);
    const allPlatformStatus = await Promise.all(response.map(async platformStatus => {
        return await statusFormat(platformStatus);
    }));

    const disclamer = {
        name: "\u200b",
        value: "*Les status sont récupéré directement depuis l'api d'ubisoft\nCe système est actuellement en bêta*"
    };

    const data = {
        username: "Rainbow six - Server Status",
        avatar_url: "https://i.imgur.com/n4b4oEw.png",
        content: null,
        embeds: [{
            thumbnail: {
                url: "https://i.imgur.com/SnNklbU.gif"
            },
            title: "Status des serveur de Rainbow six siège",
            url: "https://www.ubisoft.com/en-us/game/rainbow-six/siege/status",
            description: "**Toues les dix minutes nous actualisons ce message pour vous tenir au courant sur le status des serveurs de rainbow six**",
            fields: [...allPlatformStatus, disclamer],
            timestamp: new Date().toISOString(),
            footer: {
                text: "dernière mise à jour",
                icon_url: "https://i.imgur.com/SnNklbU.gif"
            }
        }]
    };
    console.log(allPlatformStatus);
    await axios.patch(process.env.WEBHOOK_TOKEN + "/messages/" + process.env.MESSAGE_ID, data);
}

// eslint-disable-next-line no-unused-vars
async function initFirstMessage() {
    try {
        await axios.post(process.env.WEBHOOK_TOKEN, {
            username: "Rainbow six - Server Status",
            avatar_url: "https://i.imgur.com/n4b4oEw.png",
            content: "Wip"
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}
// initFirstMessage();

setInterval(() => {
    patchWebhook();
}, 10 * 60 * 1000);
