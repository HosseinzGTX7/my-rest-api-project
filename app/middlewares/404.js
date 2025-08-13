module.exports = (app) => {
    app.use((req, res) => {
        res.status(404).send({
            code: 'Not Found',
            status: 404,
            messsage: 'requested resource could be not found...'

        })
    })
}

// const boot = (app) => {
//     app.use((req, res) => {
//         res.status(404).send({
//             code: 'Not Found',
//             status: 404,
//             messsage: 'requested resource could be not found...'

//         })
//     })
// }
// module.exports = boot