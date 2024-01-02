const mongoose = require('mongoose');

class DatabaseService {
    constructor() {
        console.log('DB: ', process.env.MONGO_URI);
        this.mongoURI = process.env['DB'];
    }

    connect() {
        mongoose.connect(
            this.mongoURI, 
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
    }
}

module.exports = new DatabaseService();