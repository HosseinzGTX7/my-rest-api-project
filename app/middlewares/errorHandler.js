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

module.exports = (app) => {
    app.use((req, res) => {
        res.status(404).send({
            Code: 'Not Found',
            Status: 404,
            Messsage: 'requested resource could be not found...'

        })
    })
}