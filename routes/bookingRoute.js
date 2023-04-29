const express = require('express');
const router = express.Router();
const client = require('../config/mongoDb');
const { ObjectId } = require('mongodb');

const db = client.db('BusCounter');
const collection = db.collection('bookings');
const collectionWithDate = db.collection('tripsWithDate');

router.post('/add', (req, res) => {
	// console.log(req.body);
	if (req.body.trip_name) {
		collection.insertOne(
			{
				trip_from: req.body.trip_from,
				trip_to: req.body.trip_to,
				trip_name: req.body.trip_name,
				trip_id: req.body.trip_id,
				passenger_name: req.body.passenger_name,
				sit_selected: req.body.sit_selected,
				trip_date: req.body.trip_date,
				trip_time: req.body.trip_time,
				charge: req.body.charge,
				chada: req.body.chada,
				commission: req.body.commission,
				other_charges: req.body.other_charges,
				total: req.body.total,
				grand_total: req.body.grand_total,
			},
			(err, result) => {
				if (err) {
					res.send(err);
				} else {
					collectionWithDate.findOne(
						{ _id: ObjectId(req.body.trip_id) },
						(err, result) => {
							if (err) {
								res.send(err);
							} else {
								// console.log(result);
								const updated = result.trips.map(item => {
									if (item.trip_time === req.body.trip_time) {
										return { ...item, sits: req.body.sits };
									} else {
										return item;
									}
								});
								collectionWithDate.updateOne(
									{ _id: ObjectId(req.body.trip_id) },
									{
										$set: {
											trips: updated,
										},
									},
									(err, result) => {
										if (err) {
											res.send(err);
										} else {
											// console.log(result);
										}
									}
								);
								// console.log(updated , 'updated');
							}
						}
					);
					res.send({ message: 'Trip Booked successfully' });
				}
			}
		);
	} else {
		res.status(400).send({ message: 'Trip name(trip_name) is required' });
	}
});

router.get('/all', (req, res) => {
	collection.find({}).toArray((err, result) => {
		if (err) {
			res.status(400).send(err);
		} else {
			res.send(result);
		}
	});
});

router.put('/approve/:id', (req, res) => {
	const id = req.params.id;
	collection.updateOne(
		{ _id: ObjectId(id) },
		{
			$set: {
				status: 'approved',
			},
		},
		(err, result) => {
			if (err) {
				res.send(err);
			} else {
				res.send({ message: 'Trip approved successfully' });
			}
		}
	);
});

router.delete('/delete/:id', (req, res) => {
	const id = req.params.id;
	collection.deleteOne({ _id: ObjectId(id) }, (err, result) => {
		if (err) {
			res.status(400).send(err);
		} else {
			collectionWithDate.findOne(
				{ _id: ObjectId(req.body.trip_id) },
				(err, result) => {
					if (err) {
						res.send(err);
					} else {
						const updated = result.trips.map(item => {
							if (item.trip_time === req.body.trip_time) {
								// update the sit object
								let sits = item.sits;
								req.body.sit_selected.forEach(sit => {
									if (Object.keys(sits).includes(sit)) {
										sits = { ...sits, [sit]: !sits[sit] };
									}
									return null;
								});

								return { ...item, sits };
							}
						});

						collectionWithDate.updateOne(
							{ _id: ObjectId(req.body.trip_id) },
							{
								$set: {
									trips: updated,
								},
							},
							(err, result) => {
								if (err) {
									res.send(err);
								} else {
									res.send({ message: 'Trip deleted successfully' });
								}
							}
						);
					}
				}
			);
		}
	});
});

module.exports = router;
