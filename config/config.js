module.exports = {

	ipaddress : process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	port      : process.env.OPENSHIFT_NODEJS_PORT || 1000,

    userSecret : 'some words...',
    adminSecret: 'Putin - Huilo, la-la-la-la-la-la-la-la!',
    // Рабочая база:
    db: 'mongodb://anton:123123@ds031671.mongolab.com:31671/happy-turtles',
    // Тестовая база:
    //db: 'mongodb://test:test@ds047955.mongolab.com:47955/happy-test',
    demothemes: [
        '553e9d954248ab20110c3408',
        '553e7b8fdbb11540045ca7ef',
        '553ecb0a1d08908c160edf6d',
        '553e9ec904753b101312de78',
        '5545d44a199898c41d3eac32',
        '56a873e3111d689986ae2120',
        '56a873a3111d689986ae211d',
        '56a87385111d689986ae211c',
        '56a81d76b8794227ba528391',
        '56a873b7111d689986ae211e'
    ]
};

