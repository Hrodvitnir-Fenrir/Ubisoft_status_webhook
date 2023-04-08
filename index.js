require("dotenv/config");
const { default: axios } = require("axios");

async function getApiStatus() {
    try {
        const response = await axios.all([
            axios.get("https://game-status-api.ubisoft.com/v1/instances?appIds=e3d5ea9e-50bd-43b7-88bf-39794f4e3d40"),
            axios.get("https://game-status-api.ubisoft.com/v1/instances?spaceIds=57e580a1-6383-4506-9509-10a390b7e2f1,05bfb3f7-6c21-4c42-be1f-97a33fb5cf66,96c1d424-057e-4ff7-860b-6b9c9222bdbf,98a601e5-ca91-4440-b1c5-753f601a2c90,631d8095-c443-4e21-b301-4af1a0929c27")
        ]).then(axios.spread((pcStatus, consolesStatus) => {
            // if (pcStatus.status != 200 || consolesStatus.status != 200 ||)
            return [pcStatus.data, consolesStatus.data];
        }));
        return response;
    } catch (error) {
        return null;
    }
}

async function statusFormat(status) {
    
}

async function patchWebhook() {
    let pcStatus;
    let ps4Status;
    const response = await getApiStatus();
    // console.log(response);

    if (response[0][0].Platform == "PC") {
        if (response[0][0].Status == "Online") {
            pcStatus = {
                name: "Serveurs Pc",
                value: "🟢 En ligne",
                inline: false
            };
        } else {
            pcStatus = {
                name: "Serveurs Pc",
                value: "🔴 Maintenance",
                inline: false
            };
        }
    } else {
        pcStatus = {
            name: "Serveurs Pc",
            value: "❓ information non récupérable",
            inline: false
        };
    }

    if (response[1][0].Platform == "PS4") {
        if (response[1][0].Status == "Online") {
            ps4Status = {
                name: "Serveurs PS4",
                value: "🟢 En ligne",
                inline: true
            };
        } else {
            ps4Status = {
                name: "Serveurs PS4",
                value: "🔴 Maintenance",
                inline: true
            };
        }
    } else {
        ps4Status = {
            name: "Serveurs PS4",
            value: "❓ information non récupérable",
            inline: true
        };
    }

    const data = {
        username: "Rainbow six - Server Status",
        avatar_url: "https://i.imgur.com/SnNklbU.gif",
        content: null,
        embeds: [{
            thumbnail: {
                url: "https://i.imgur.com/SnNklbU.gif"
            },
            title: "Status des serveur de Rainbow six siège",
            url: "https://www.ubisoft.com/en-us/game/rainbow-six/siege/status",
            description: "**Toues les heures nous actualisons ce message pour vous tenir au courant sur le status de serveur de rainbow six**",
            fields: [
                pcStatus,
                ps4Status,
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "dernière mise à jour",
                icon_url: "https://i.imgur.com/SnNklbU.gif"
            }
        }]
    };

    await axios.post(process.env.WEBHOOK_TOKEN, data);
    // setInterval(async () => {
    //     const response = await getApiStatus();

    //     console.log(response);
    // }, 60 * 60 * 1000);
    // try {
    //     await axios.patch(process.env.WEBHOOK_TOKEN + "/messages/" + process.env.MESSAGE_ID, {
    //         content: "je suis un autre message 2"
    //     });
    // } catch (error) {
    //     console.log(error);
    // }
}

async function initFirstMessage() {
    try {
        await axios.post(process.env.WEBHOOK_TOKEN, {
            content: "je suis un test"
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
    }
}

patchWebhook();
