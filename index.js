require("dotenv/config");
const { default: axios } = require("axios");

async function getApiStatus() {
    try {
        const response = await axios.get("https://game-status-api.ubisoft.com/v1/instances?appIds=e3d5ea9e-50bd-43b7-88bf-39794f4e3d40,fb4cc4c9-2063-461d-a1e8-84a7d36525fc,4008612d-3baf-49e4-957a-33066726a7bc");
        return response.data;
    } catch (error) {
        return null;
    }
}

async function statusFormat(status) {
    if (!status || !status.Status) {
        return { name: "Information non récupérable", value: "❓" };
    }

    const platformMap = { XBOXONE: "Xbox", PS4: "Playstation" };
    const platform = platformMap[status.Platform] || "PC";

    const online = status.Status === "Online";
    const value = online ? "🟢 En ligne" : "🔴 Maintenance";

    return { name: platform, value };
}

async function patchWebhook() {
    const response = await getApiStatus();
    // console.log(response);
    const allPlatformStatus = await Promise.all(response.map(async platformStatus => {
        return await statusFormat(platformStatus);
    }));

    const disclamer = {
        name: "\u200b",
        value: "*Les statuts sont récupéré directement depuis l'api d'Ubisoft.\nCe système est actuellement en bêta.*"
    };

    const data = {
        username: "Rainbow six - Server Status",
        avatar_url: "https://i.imgur.com/n4b4oEw.png",
        content: null,
        embeds: [{
            thumbnail: {
                url: "https://i.imgur.com/SnNklbU.gif"
            },
            title: "Statuts des serveurs de Rainbow six siège",
            url: "https://www.ubisoft.com/en-us/game/rainbow-six/siege/status",
            description: "**Toutes les cinq minutes nous actualisons ce message pour vous tenir au courant sur le statut des serveurs de Rainbow Six.**",
            fields: [...allPlatformStatus, disclamer],
            timestamp: new Date().toISOString(),
            footer: {
                text: "dernière mise à jour",
                icon_url: "https://i.imgur.com/SnNklbU.gif"
            }
        }]
    };
    // console.log(allPlatformStatus);
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
patchWebhook();

setInterval(() => {
    patchWebhook();
}, 5 * 60 * 1000);
