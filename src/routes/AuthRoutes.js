

const router = require('express').Router();
const User = require('../Models/User');
const {isRegisterValid, isLoginValid} = require('../Validation/Login');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const BillsService = require('../Models/BillsService');
const Services = require('../Models/Services');
const {nanoid} = require('nanoid');

router.post('/register', async (req, res) => {
    //validation
    const {error} = isRegisterValid(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const isEmailExist = await User.findOne({email: req.body.email});
    if (isEmailExist) return res.status(400).send('Email already exist');

    //hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const {name, email} = req.body;
    const user = new User({
        name,
        email, 
        password: hashedPassword
    });
    const billsService = new BillsService({
        serviceId: nanoid(10),
        publicUtilityPayments: {
            [new Date().getFullYear()]: []
        }
    });
    const userServices = new Services({
        userId: user._id,
        services: [billsService.serviceId]
    });

    try {
        const savedUser = await user.save();

        await billsService.save();
        await userServices.save();

        res.send(user._id);
    } catch(err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    //validation
    const {error} = isLoginValid(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Email or password is wrong');
    //password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    //create token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send({token, userId: user._id});
});

module.exports = router;