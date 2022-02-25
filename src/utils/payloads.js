import { rmDashes } from "./UUIDutils.js"
import { signData } from "./keyUtils.js"
import moment from "moment"

export const createOkAuthPayload = (name, accessToken, clientToken, uuid, requestUser) => ({
    "accessToken": accessToken,
    "clientToken": clientToken,
    "availableProfiles": [
        {
            "id": rmDashes(uuid),
            "name": name
        }
    ],
    "selectedProfile": {
        "id": rmDashes(uuid),
        "name": name
    },
    ...(requestUser ? {
        "user": {
            "id": rmDashes(uuid),
            "username": name,
            "properties": [
                {
                    "name": "preferredLanguage",
                    "value": "ru"
                }
            ]
        }
    } : {})
})

export const createOkRefreshPayload = (name, accessToken, clientToken, uuid, requestUser) => ({
    "accessToken": accessToken,
    "clientToken": clientToken,
    "selectedProfile": {
        "id": rmDashes(uuid),
        "name": name
    },
    ...(requestUser ? {
        "user": {
            "id": rmDashes(uuid),
            "username": name,
            "properties": [
                {
                    "name": "preferredLanguage",
                    "value": "ru"
                }
            ]
        }
    } : {})
})

export const createErrorPayload = (error, errorMessage) => ({
    "error": error,              // short description based on code
    "errorMessage": errorMessage // not so short description
})

export const createHasJoinedPayload = (user, signed) => {
    const valueJson = {
        timestamp: moment().unix(),
        profileId: rmDashes(user.uuid),
        profileName: user.name,
        textures: {
            SKIN: {
                url: user.skin.url ? user.skin.url : `${process.env.HOST}/texture/skin/steve`,
                metadata: {
                    model: user.skin.type
                }
            }
        }
    };
    if (user.cape.url) {
        valueJson.textures.CAPE = {
            url: user.cape.url
        };
    }
    console.log(valueJson);

    const value = Buffer.from(JSON.stringify(valueJson)).toString('base64')

    const response = {
        id: rmDashes(user.uuid),
        name: user.name,
        properties: [
            {
                name: "textures",
                value: value
            },
            {
                name: "uploadableTextures",
                value: "skin,cape"
            }
        ]
    };

    if (signed) {
        response.properties[0].signature = signData(value);
    }

    return response;
}