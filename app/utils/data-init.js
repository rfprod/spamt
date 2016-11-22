const User = require('../models/users');

module.exports = {

	createDefaultAdmin: function (callback) {
		User.find({id: 0}, (err, docs) => {
			if (err) throw err;
			if (docs.length == 0) {
				let newUser = new User();
				newUser.id = 0;
				newUser.role = 'admin';
				newUser.registered = new Date().getTime();
				newUser.lastLogin = new Date().getTime();
				newUser.userExtended = {
					email: 'admin@email.email',
					salt: '',
					pass: '000',
					passResetToken: '',
					firstName: 'first name 0',
					lastName: 'last name 0',
					city: 'city 0',
					country: 'country 0'
				};
				newUser.save((err) => {
					if (err) throw err;
					console.log('default user id 0 created');
					callback(newUser);
				});
			} else {
				console.log('admin exists');
				callback(docs[0]);
			}
		});
	},

	createDefaultUser: function (callback){
		User.find({id: 1}, (err, docs) => {
			if (err) throw err;
			if (docs.length == 0) {
				let newUser = new User();
				newUser.id = 1;
				newUser.role = 'user';
				newUser.registered = new Date().getTime();
				newUser.lastLogin = new Date().getTime();
				newUser.userExtended = {
					email: 'user1@email.email',
					salt: '',
					pass: '000',
					passResetToken: '',
					firstName: 'first name 1',
					lastName: 'last name 1',
					city: 'city 1',
					country: 'country 1'
				};
				newUser.save((err) => {
					if (err) throw err;
					console.log('default user id 1 created');
					callback(newUser);
				});
			} else {
				console.log('user exists');
				callback(docs[0]);
			}
		});
	},

	initData: function (callback) {
		console.log('db data initialization');
		let response = {};
		this.createDefaultAdmin((admin) => {
			response.defaultAdminAccount = admin;

			this.createDefaultUser((user) => {
				response.defaultUserAccount = user;
				console.log('data initialized:', response);
				if (callback) callback();
			});
		});
	}

};
