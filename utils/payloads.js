
// requestUser has to be a bool value, no matter what
// so the check for undefined, ..etc, should be made
// on spot where it gets called
export const createOkAuthPayload = (name, accessToken, clientToken, uuid, requestUser) => ({
    "accessToken": accessToken,
    "clientToken": clientToken,
    "availableProfiles": [
        {
            "id": uuid.replace(/-/g, ''),
            "name": name
        }
    ],
    "selectedProfile": {
        "id": uuid.replace(/-/g, ''),
        "name": name
    },
    ...(requestUser ? {
        "user": {
            "id": uuid.replace(/-/g, ''),
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
        "id": uuid.replace(/-/g,''),
        "name": name
    },
    ...(requestUser ? {
        "user": {
            "id": uuid.replace(/-/g, ''),
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

export const createHasJoinedPayload = {
    
}