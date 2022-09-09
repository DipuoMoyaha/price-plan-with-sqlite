import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import express from 'express';
const app = express();
app.use(express.json());
const db = await sqlite.open({
    filename: './data_plan.db',
    driver: sqlite3.Database
});
await db.migrate();


app.post(`/api/price_plan/update/`, async function(req, res) {
   // console.log(req.body)
    const {
        sms_cost,
        call_cost,
        name
    } = req.body;
    const result = await db.run(`update price_plan set sms_price = ?, call_price = ? where plan_name = ?`,
        sms_cost,
        call_cost,
        name);
    res.json({
        status: 'success'
    })
});
console.log('stop')


app.get(`/api/price_plans`, async function(req, res) {
    const price_plans = await db.all(`select * from price_plan`);
    res.json({
        price_plans
    })
});


app.post(`/api/phonebill/`, async function(req, res) {
   // console.log(req.body);
    const price_plan = await db.get(`SELECT id, plan_name, sms_price, call_price
    FROM price_plan where plan_name = ?`, req.body.price_plan);

    if (!price_plan) {
        res.json({
            error:``
        });
    } else {
        
        const activity = req.body.actions;
        const activities = activity.split(",");
        let total = 0;
        activities.forEach(action => {
            if (action.trim() === 'sms') {
                total += price_plan.sms_price;
            } else if (action.trim() == 'call') {
                total += price_plan.call_price;
            }
        });
        res.json({
            total
        })
    }
});

app.post('/api/price_plan/delete', async function(req,res){

    const{id}=req.body

    const result = await db.run('delete from price_plan where id =?', id)

    res.json({
        status: 'successfully deleted'
    })
})


const PORT = 6009;

app.listen(PORT, function(){
    console.log('api is started on the port', PORT)

});