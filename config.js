module.exports = {

	ipaddress : process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	port      : process.env.OPENSHIFT_NODEJS_PORT || 3000,

    userSecret : 'some words...',
    adminSecret: 'Putin - Huilo, la-la-la-la-la-la-la-la!',
    db: 'mongodb://anton:123123@ds031671.mongolab.com:31671/happy-turtles',
    demothemes: [
        '553e9d954248ab20110c3408',
        '553e7b8fdbb11540045ca7ef',
        '553ecb2a1d08908c160edf6e'
    ]
};