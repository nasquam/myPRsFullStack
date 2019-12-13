const { PersonalRecord } = require('../models/personalRecord');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send('Welcome to Personal Records Endpoint')
})

function getDate() {
    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let today = month.toString() + "-" + day.toString() + "-" + year.toString();
    return today;
}

//? get entries for 1 movement
//! Added auth as middlerware 
// router.get('/:id', auth, async (req, res) => {
  
//     try {
       
//     const id = req.params.id;
//     const movement = req.query.movement;
//     let record = await PersonalRecord.findById(id);

//     if (movement === 'lifts') {
//         res.send(record.lifts)
//     } else if (movement === 'cardio') {
//         res.send(record.cardio)
//     } else if (movement === 'skills') {
//         res.send(record.skills)
//     }

//     } catch (error) {
//         res.send(error);
//     }
// })
//! No authorization 
router.get('/:id', async (req, res) => {
  console.log('heard the GET')
    try {
       
    const id = req.params.id;
    const movement = req.query.movement;
    console.log(id)
    console.log(movement)

    //! Steven hard coded the "user_id" from personal records collection  or _id user collection
    let record = await PersonalRecord.findOne({ user_id: "5dc9523d477fcc4e38652dd6"});
    
    console.log(record)

    if (movement === 'lifts') {
        res.send(record.lifts)
    } else if (movement === 'cardio') {
        res.send(record.cardio)
    } else if (movement === 'skills') {
        res.send(record.skills)
    } else {
        res.send('Why is this not getting in here')
    }
   
    } catch (error) {
        res.send(error);
    }
})

//! added auth as middleware
//router.post('/', auth, async (req, res) => {
    router.post('/', async (req, res) => {
        console.log('heard post')
    try {
        let cardios = req.body.cardio
        let lifts = req.body.lifts
        let skills = req.body.skills

        cardios.forEach(cardio => {
            cardio.date = getDate()
        });

        lifts.forEach(lift => {
            lift.date = getDate()
        });

        skills.forEach(skill => {
            skill.date = getDate()
        });

        let PersonalRecordToAdd = new PersonalRecord({
            user_id: req.body.user_id,
            lifts: lifts,
            cardio: cardios,
            skills: skills
        })

        let PersonalRecordToAddResult = await PersonalRecordToAdd.save();
        console.log(PersonalRecordToAddResult)
        res.send(PersonalRecordToAddResult)

    } catch (error) {
        res.send(error);
    }
})

//? Add one entry 
//! added auth middleware
router.put('/:id', auth, async (req, res) => {
    try {

        const movement = req.body.movement
        const document = req.body.document
        const id = req.params.id
        let record = await PersonalRecord.findById(id)

        let recordToAdd = {
            name: document.name,
            preDefined: false,
            comment: document.comment,
            personalRecord: document.personalRecord,
            date: getDate()
        }

        if (movement === 'lifts') {
            record.lift.push(recordToAdd)
        } else if (movement === 'cardio') {
            record.cardio.push(recordToAdd)
        } else if (movement === 'skills') {
            record.skills.push(recordToAdd)
        }

        let recordResult = await record.save()
        res.send(recordResult);        

    } catch (error) {
        res.send(error);
    }
})

//? remove one entry 
//! added auth middleware
router.put('/delete/:parent_id', auth, async (req, res) => {
    try {           

        const movement = req.body.movement
        const child_id = req.body.child_id
        const parent_id = req.params.parent_id
        
        let record = await PersonalRecord.findById(parent_id)
        let result 
      
        if (movement === 'lifts') {
            let subRecord = record.lifts.id(child_id)
            result = subRecord.remove();
        } 
        else if (movement === 'cardio') {
            let subRecord = record.cardio.id(child_id)
            result = subRecord.remove();
        } 
        else if (movement === 'skills') {
            let subRecord = record.skills.id(child_id)
            result = subRecord.remove();
        }

        record.save()
        res.send(result)
       
    } catch (error) {
        res.send(error);
    }

})


module.exports = router;