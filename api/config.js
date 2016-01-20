module.exports = {

	ipaddress : process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	port      : process.env.OPENSHIFT_NODEJS_PORT || 3000,

    userSecret : 'some words...',
    adminSecret: 'Putin - Huilo, la-la-la-la-la-la-la-la!',
    db: 'mongodb://test:test@ds061611.mongolab.com:61611/jobfinder'
};