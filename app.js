const express = require('express');
const app = express();
const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

require('dotenv').config();

const jwt = require('jsonwebtoken');

// Load in the mongoose models
const { List, Task } = require('./db/models');
const { Topic } = require('./db/models/topic.model');
const { Feedback } = require('./db/models/feedback.model');
const { User } = require('./db/models/user.model');

// Load middleware
app.use(bodyParser.json());

// CORS HEADERS MIDDLEWARE
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", '*');
    next();
  });

/* SERVER LISTEN */
app.listen(3000, () => {
    console.log("Server listening on port 3000");
});

/* LIST ROUTES */
app.get('/', (req, res) => {
    res.send("Willkommen beim ärzte.de Feedback Tool!");
});

/**
 * POST /login
 * Purpose: Authenticate a user

app.post('/login', (req, res) => {
    // Authenticate the user
    const userName = res.body;
    res.send(userName);
}); */

/**
 * GET all topics
 * Purpose: Retrieve all topics from db
 */
app.get('/topics', (req, res) => {
    Topic.find( {} ).sort({ date: -1 })
    .then( (topics) => {
        res.send(topics);
    });
});

/**
 * GET current topics
 * Purpose get the latest topics open for feedback from db
 */
app.get('/topics/latest', (req, res) => {
    Topic.find({'openForFeedback':true}).sort({ date: -1 })
    .then( (topic) => {
        res.send(topic);
    })
});

/**
 * GET single topic
 * Purpose: Retrieve a single topic from db
 */
app.get('/topics/:id', (req, res) => {
    Topic.findById(req.params.id ).then( (topic)  => {
        res.send(topic);
    });
});


/**
 * POST /topics
 * Purpose: Create a new topic
 */
app.post('/topics', authenticateToken, (req, res) => {
    // Create a new topic and return the new topic document back to the user (including the id)
    // The topic information will be passed in via the JSON request body
    
    let title = req.body.title;
    let description = req.body.description;
    let feedbackDeadline = req.body.feedbackDeadline;
    let openForFeedback = req.body.openForFeedback;
    let newTopic = new Topic({
        title,
        description,
        feedbackDeadline,
        openForFeedback
    });
    newTopic.save().then( (topicDocument) => {
        // Full topic document (including id) is returned
        res.send(topicDocument);
    });
});

/**
 * GET /topics/:id/feedback
 * Purpose: Retrieve all feedback related to a certain topic (specified by topicId)
 */
app.get('/topics/:id/feedback', authenticateToken, (req, res) => {
    Feedback.find({
        _topicId: req.params.id
    }).then( (feedback) => {
        res.send(feedback);
    })
}); 

/**
 * PATCH /topics/:id/feedback
 * Purpose: Update a single topic (specified by topicId)
 */
app.patch('/topics/:id/', authenticateToken, (req, res) => {
    const updatedTopic = req.body;
    Topic.findOneAndUpdate(
        {_id: req.params.id },
        updatedTopic 
    ).then( (topic) => {

        res.send(topic);
    })
}); 

/**
 * DELETE /topics/:id/
 * Purpose: Delete a specified topic (specified by topicId)
 */
app.delete('/topics/:id', authenticateToken, (req, res) => {
    // Delete the specified task
    if(mongoose.Types.ObjectId.isValid(req.params.id)){
        Topic.findOneAndDelete({ 
            _id: req.params.id,
        }).then( (removedTaskDoc) => {
            if(removedTaskDoc){
                return res.status(200).send(removedTaskDoc);
            }
            
        }); 
    } else {
        return res.status(422).send();
    }
});

/**
 * GET /feedback
 * Purpose: Retrieve all current feedbacks from db
 */
app.get('/feedback', authenticateToken, (req, res) => {
    Feedback.find({}).then( (feedback) => {
        res.send(feedback);
    })
}); 

/**
 * POST /feedback
 * Purpose: Create a new feedback entry
 */
app.post('/feedback', (req, res) => {
    // Create a new topic and return the new topic document back to the user (including the id)
    // The topic information will be passed in via the JSON request body
    
    let feedback = req.body.feedback;
    let _topicId = mongoose.Types.ObjectId(req.body.topicId);

    let newFeedback = new Feedback({
        feedback,
        _topicId
    });
    // Todo: check for valid object 
    newFeedback.save().then( (feedbackDocument) => {
        // Full topic document (including id) is returned
        res.send(feedbackDocument);
    });
});

/**
 * DELETE /lists/:listId/taks/:taskId
 * Purpose: Delete a specified taks in a specified list
 */
app.delete('/feedback/:id', authenticateToken, (req, res) => {
    // Check if we received a valid id
    if(mongoose.Types.ObjectId.isValid(req.params.id)) {
        // Delete the specified task
        Feedback.findOneAndRemove({ 
            _id: req.params.id,
        }).then( (removedTaskDoc) => {
            res.send(removedTaskDoc);
        }); 
    } else {
        res.status(422).send();
    }
    
});


app.get('/users', (req, res) => {
    User.find({})
    .then((usersDocument)=> { 
        res.send(usersDocument);
    });
});

/**
 * Todo: remove this or refactor it to be more safe
 */
app.delete('/users', (req, res) => {
    User.deleteMany({email: "tech@arzttermine.de"}).then( result => { res.send(result) });
});

/**
 * POST /login
 * Purpose: Login a user
 */
app.post('/login', async (req, res) => {
    
    // Try to find user in DB
    const user = await User.findOne({email: req.body.email}, (error, userItem) => {
        return userItem;
    })
    // User exists?
    if( user == null ) {
        return res.status(400).send('User not found');
    }
    // User entered right credentials?
    try {
        if( await bcrypt.compare(req.body.password, user.password) ) {
            // Todo: JWT Part
            const accessToken = jwt.sign({ email: req.body.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' } );
            return res.status(200).send( { userId:user._id, accessToken: accessToken } );
        } else {
            return res.status(401).send('Wrong credentials');
        }
    } catch {
        return res.status(500).send();
    }
});

/**
 * POST /users/create
 * Purpose: Create a new user in DB
 */
app.post('/users/create', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const userMail = req.body.email;

        const newUser = new User({
            email: userMail,
            password: hashedPassword
        });

        newUser.save().then( (userDocument) => {
            res.status(201).send(userDocument);
        });

    } catch {
        res.status(500).send();
    }
});


/**
 * authenticateToken();
 * Purpose: Authentication middleware function to check if the user sent a valid token
 */
function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if( token == null ) return res.sendStatus(401);
   
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if (err) return res.sendStatus(403);
        next();
    });

}