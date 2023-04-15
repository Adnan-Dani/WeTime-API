const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const openai = require('./../config/openai');

router.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
}));
const chatHistoryFolderPath = path.join(__dirname, '..', 'chat_history');

let chatHistory = {};

fs.readdir(chatHistoryFolderPath, 'utf8', (err, files) => {
    if (!err) {
        files.forEach((file) => {
            const filePath = path.join(chatHistoryFolderPath, file);
            const userId = file.split('.')[0];

            if (fs.existsSync(filePath)) {
                const chatData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                chatHistory[userId] = chatData;
            } else {
                console.log(`File ${filePath} does not exist. Creating new file for user ${userId}.`);
                chatHistory[userId] = [];
                const newFilePath = path.join(chatHistoryFolderPath, `${userId}.json`);
                fs.writeFileSync(newFilePath, '[]', 'utf8');
            }
        });
    }
});


router.post('/', async (req, res) => {
    const message = req.body.message;
    const userId = req.body.userId;
    let conversation = chatHistory[userId];

    if (!message) {
        return res.status(400).send('Message is required.');
    }

    if (!conversation) {
        conversation = [
            {
                role: 'system',
                content: `How may I help you? Today's date is ${new Date().toDateString()}.`,
            },
            {
                role: 'user',
                content: message,
            },
        ];

        chatHistory[userId] = conversation;
    } else {
        conversation.push({
            role: 'user',
            content: message,
        });
    }

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: conversation,
        });

        console.log(completion.data.choices[0]);

        const botMessage = completion.data.choices[0].text || completion.data.choices[0].message.content;

        conversation.push({
            role: 'system',
            content: botMessage,
        });

        chatHistory[userId] = conversation;

        // Update chat history in memory and file
        const chatHistoryFileName = `${userId}.json`;
        const chatHistoryFilePath = path.join(chatHistoryFolderPath, chatHistoryFileName);

        if (fs.existsSync(chatHistoryFilePath)) {
            // If a file already exists for this user, load the existing chat history
            const existingChatData = JSON.parse(fs.readFileSync(chatHistoryFilePath, 'utf8'));
            conversation = existingChatData.concat(conversation);
        }

        const chatHistoryString = JSON.stringify(conversation);

        fs.writeFile(chatHistoryFilePath, chatHistoryString, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`Chat history saved to file: ${chatHistoryFileName}`);
            }
        });

        return res.status(200).send({
            userId: userId,
            bot: botMessage
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred during the chat completion process.');
    }
});



router.get('/:userId', (req, res) => {
    const userId = req.params.userId;

    // Load chat history for the user from memory
    const conversation = chatHistory[userId];

    if (!conversation) {
        return res.status(404).send('Conversation not found.');
    }

    res.status(200).send(conversation);
});

module.exports = router;
