const cuid = require('cuid');
const allPastGoals = [{
    type: 'Daily',
    checkedAmt: 0,
    goals: [{goal: 'Yes', id: cuid(), checked: false}, {goal: 'Yeet', id: cuid(), checked: false}, {
        goal: 'How it goes',
        id: cuid(),
        checked: false
    }],
    id: 1,
    date: new Date().toISOString()
}, {
    type: 'Weekly',
    checkedAmt: 0,
    goals: [{goal: 'Cool', id: cuid(), checked: false}, {goal: 'Dope', id: cuid(), checked: false}],
    id: 2,
    date: new Date().toISOString()
}, {
    type: 'Weekly',
    checkedAmt: 0,
    goals: [{goal: 'Cool', id: cuid(), checked: false}, {goal: 'Dope', id: cuid(), checked: false}],
    id: 3,
    date: new Date().toISOString()
}, {
    type: 'Quarterly',
    checkedAmt: 0,
    goals: [{goal: 'Cool', id: cuid(), checked: false}, {goal: 'Dope', id: cuid(), checked: false}],
    id: 4,
    date: new Date().toISOString()
}];
module.exports =  allPastGoals;