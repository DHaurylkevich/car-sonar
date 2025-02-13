const cron = require('node-cron');
const Manager = require("../");

let task;

const startCron = async (bot) => {
    console.log('Cron task started');
    task = cron.schedule('*/5 * * * *', async () => {
        await Manager.run(bot);
    }, {
        scheduled: false
    });

    task.start();
};

const stopCron = async () => {
    if (task) {
        task.stop();
        console.log('Cron task stopped');
    }
};

module.exports = { startCron, stopCron };