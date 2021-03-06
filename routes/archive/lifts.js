const { Lifts, validate } = require('../../models/lifts');
const Joi = require('@hapi/joi');

const express = require('express');
const router = express.Router();



/* GET lifts listing. */
router.get('/', async function (req, res) {
    const lifts = await Lifts.find();
    res.send(lifts);
});



router.get('/:id', (req, res) => {
    
    let lift = lifts.find(g => g.id === parseInt(req.params.id));
    if (!lift) return res.status(404).send('The lift with the given ID was not found');
    res.send(lift);
});

router.post('/', async (req, res) => {
    
    let bodyLift = {
        name: req.body.name,
        description: req.body.description,
        preDefined: false
    }

    try {
        
        let validated = validate(bodyLift);
       
        if (validated.error) {
            let errorMsg = validated.error.details[0].message
            return res.status(400).send(errorMsg);
        } 

        let lift = new Lifts({
            name: bodyLift.name,
            description: bodyLift.description,
            preDefined: false
        })
      
        let result = await lift.save()
      
        res.send(result)

    } catch (error) {
       
        console.log(error)
 

    }

});

router.put('/:id', (req, res) => {

    let lift = lifts.find(l => l.id === parseInt(req.params.id));
    if (!lift) return res.status(404).send('The lift with the given ID was not found');

    let {
        error
    } = validateNewEntry(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let entries = lift.maxLog;

    entries.push({
        date: req.body.date = new Date(),
        weight: req.body.weight
    })
    res.send(entries)
});

router.delete('/:id', (req, res) => {

    let lift = lifts.find(l => l.id === parseInt(req.params.id));
    if (!lift) return res.status(404).send('The lift with the given ID was not found');

    let index = lifts.indexOf(lift);
    lifts.splice(index, 1);

    res.send(lift);
});


function validateNewEntry(lift) {
    const schema = {
        weight: Joi.string().required()
    };
    return Joi.validate(lift, schema);
}

module.exports = router;