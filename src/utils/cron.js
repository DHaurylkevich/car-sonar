const cron = require('node-cron');
const Manager = require("..");
const Logger = require('./logger');

let task;

const startCron = async (bot) => {
    task = cron.schedule('*/5 * * * *', async () => {
        try {
            Logger.info('Cron task started');
            Logger.info(new Date().toLocaleTimeString());
            await Manager.run(bot);
        } catch (e) {
            Logger.error(e);
        }
    }, {
        scheduled: false
    });
    try {
        await Manager.run(bot);
    } catch (e) {
        console.log(e);
    }
    
    task.start();
};

const stopCron = async () => {
    if (task) {
        task.stop();
        console.log('Cron task stopped');
    }
};

module.exports = { startCron, stopCron };