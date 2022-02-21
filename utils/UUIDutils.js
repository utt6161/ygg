
export const parseUUID = (input) => {
    input = input.toLowerCase()
    if (input.length === 36) return input
    if (input.length !== 32) return undefined
    return input.substr(0, 8) + '-' + input.substr(8, 4) + '-' + input.substr(12, 4) + '-' + input.substr(16, 4) + '-' + input.substr(20)
}

export const rmDashes = (input) => {
    return input.replace(/-/g, '');
}