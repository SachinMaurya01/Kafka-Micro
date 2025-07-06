const express = require('express');
const kafka = require('kafka-node');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());

const dbsAreRunning = async () => {
    mongoose
        .connect(process.env.MONGO_URL)
        .then(() => console.log("DB is running"))
        .catch((err) => console.log(err));
    const userSchema = new mongoose.Schema({
        name : String,
        email : String,
        password: String
    })
    const User = mongoose.model('User', userSchema);

    const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS  });
    const consumer = new kafka.Consumer(client , [{ topic: process.env.KAFKA_TOPIC }], {
        autoCommit: false
    });

    consumer.on('message', async (message) => {
        const user = await new User.create(JSON.parse(message.value));
        await user.save();
    });
    
    consumer.on('error', (err) => {
        console.error(err);
    });
}

setTimeout(dbsAreRunning, 1000);

app.listen(process.env.PORT || 3000, () =>{
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});