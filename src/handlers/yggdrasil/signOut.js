
export default (req, res, next) => {
    // basically patreon has no signout patreon endpoint
    // onto which i can knock with request and as the result, this endpoint is pointless
    // per wiki.vg it should invalidate accessTokens using an account's username and password. 
    // but we strictly do oauth, no log n pass...
    // the conclusion: 
    res.status(418).send("bri'ish tea ye?")
}