function handleApiError(err, req, res) {
    console.log(err)
    if (err.reason) {
        err.reason = err.reason.toString()
    }
    res.json({success: false, error: err, msg: err.message})
}

module.exports = {handleApiError}
