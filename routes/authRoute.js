const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const client = require('../config/mongoDb');

const db = client.db('BusCounter');
const collection = db.collection('users');

// Register a user
router.post('/register', (req, res) => {
	const { email, password, type } = req.body;
	// check if user already exists
	collection.findOne({ email }, (err, user) => {
		if (err) {
			res.send(err);
		} else if (user) {
			res.send({ message: 'User already exists' });
		} else {
			// hash password
			const hashedPassword = bcrypt.hashSync(password, 10);
			// insert new user into database
			collection.insertOne(
				{
					email,
					password: hashedPassword,
					type
				},
				(err, result) => {
					if (err) {
						res.status(500).send(err);
					} else {
						res.send({ message: 'User added successfully' });
					}
				}
			);
		}
	});
});

// Login a user
router.post('/login', (req, res) => {
	const { email, password } = req.body;
	// check if user exists
	collection.findOne({ email }, (err, user) => {
		if (err) {
			res.send(err);
		} else if (!user) {
			res.status(401).send({ message: 'User does not exist' });
		} else {
			// check if password is correct
			const isPasswordCorrect = bcrypt.compareSync(password, user.password);
			if (isPasswordCorrect) {
				res.send({
					user:{...user, password:''},
					authenticated: true,
					message: 'User logged in successfully',
				});
			} else {
				res.status(401).send({ authenticated: false, message: 'Incorrect password' });
			}
		}
	});
});

// Update a user profile
router.put('/:id', (req, res) => {
    if (req.files) {
        const encodedImage = req.files.image.data.toString('base64');
        const image = Buffer.from(encodedImage, 'base64');
        const updatedUser = {
            ...req.body,
            image,
        };
        // update user in database
        collection.updateOne(
            { _id: new mongodb.ObjectId(req.params.id) },
            { $set: updatedUser },
            (err, result) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ message: 'User updated successfully' });
                }
            }
        );
    } else {
        const updatedUser = {
            ...req.body,
        };
        // update user in database
        collection.updateOne(
            { _id: new mongodb.ObjectId(req.params.id) },
            { $set: updatedUser },
            (err, result) => {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ message: 'User updated successfully' });
                }
            }
        );
    }
});

// Delete a user profile
router.delete('/:id', (req, res) => {
	// delete user from database
	collection.deleteOne(
		{ _id: new mongodb.ObjectId(req.params.id) },
		(err, result) => {
			if (err) {
				res.send(err);
			} else {
				res.send({ message: 'User deleted successfully' });
			}
		}
	);
});


module.exports = router;
