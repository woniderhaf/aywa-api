const user = (user) => {
	user.password = null;
	return user;
}

module.exports = {
	user
}