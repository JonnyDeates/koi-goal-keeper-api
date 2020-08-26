require('dotenv').config();
const {STRIPE_SECRET} = require('./config');
const stripe = require('stripe')(STRIPE_SECRET);

async function postCharge(req, res) {
    try{
        const { source } = req.body

        const charge = await stripe.charges.create({
            amount: 500,
            currency: 'usd',
            source,
            receipt_email: req.user.username
        });

        if (!charge) throw new Error('charge unsuccessful')

        return {
            message: 'charge posted successfully',
            charge,
            error: false
        }
    } catch (error) {
        return ({
            message: error.message,
            error: true
        })
    }
}

module.exports = {postCharge};