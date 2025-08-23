module.exports = (app) => {
    app.use((req, res) => {
        res.status(404).send({
            Code: 'Not Found',
            Status: 404,
            Messsage: 'requested resource could be not found...'

        })
    })
}