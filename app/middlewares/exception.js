module.exports = (app) => {
    app.use((error, req, res, next) => { 
        const status = error.status || 500
        res.send({
            Code: 'Exception',
            status,
            en_message: error.message,
            fa_message: 'خطایی در سرور رخ داده است'
        })
    })
}