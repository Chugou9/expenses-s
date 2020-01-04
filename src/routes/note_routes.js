module.exports = function(server, db) {
    server.post('/public-utility-payments', (req, res) => {
        const newPublicUtilityPayments = {...req.body};

        console.log(req.body);
        db.collection('expensesCollection').insertOne(newPublicUtilityPayments, (err, result) => {
            if (err) {
                res.status(400).send({'error': 'An error has occured.'});
            } else {
                res.status(200).send(result.ops[0]);
            }
        });
    })
};