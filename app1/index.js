const express = require('express');
const kafka = require('kafka-node');
const app = express();
const sequelize = require('sequelize');

app.use(express.json());


const waitForKafka = async () => {
    return new Promise((resolve, reject) => {
        const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS });
        client.on('ready', () => {
            console.log('Kafka is ready');
            resolve(client);
        });

        client.on('error', (err) => {
            console.error('Kafka not ready yet. Retrying in 3s...', err.message);
            setTimeout(() => waitForKafka().then(resolve), 3000);
        });
    });
};

const dbsAreRunning = async () => {

    const db = new sequelize(process.env.DB_URL);
    const User = db.define('user', {
        name : sequelize.STRING,
        email : sequelize.STRING,
        password: sequelize.STRING
    });
    db.sync({force: true});
    
    const client = await waitForKafka();
    const producer = new kafka.Producer(client);
    
    producer.on('ready', async () => {
        console.log('Kafka is ready');
        app.get('/', async (req, res) => {
            producer.send([
                {
                    topic: process.env.KAFKA_TOPIC,
                    messages: JSON.stringify(req.body),
                },
            ], async (error, result) => {
                if (error)  console.error(error);
                else{
                    await User.create(req.body);
                    res.send(req.body)
                }
            });
        });
    });
}


setTimeout(dbsAreRunning, 10000);

app.listen(process.env.PORT || 3000, () =>{
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});