module.exports = {

	ipaddress : process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	port      : process.env.OPENSHIFT_NODEJS_PORT || 3000,

    userSecret : 'some words...',
    adminSecret: 'Putin - Huilo, la-la-la-la-la-la-la-la!',
    db: 'mongodb://anton:123123@ds031671.mongolab.com:31671/happy-turtles'
};