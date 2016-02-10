// config/auth.js
module.exports = {

    'facebookAuth' : {
        'clientID' 		: '100293117025648', // 'test' App ID
        'clientSecret' 	: '8e4c88724527a2d4f8d6d8029a735dd9', // 'test' App Secret
        'callbackURL' 	: 'http://localhost:1000/auth/facebook/callback'
    },
    'twitterAuth' : {
        'consumerKey' 		: 'SJQFU9jJzTnXsVjNanlkAynxA',
        'consumerSecret' 	: 'gYgoOI73xrxN40WUp4B2iWxODvJcw3Hwe3XVs6nLqykwOghtA3',
        'callbackURL' 		: 'http://127.0.0.1:1000/auth/twitter/callback'
    },
    'googleAuth' : {
        'clientID' 		: '382528226899-01eg84ar2mmageu13soo0vnfp791mqac.apps.googleusercontent.com',
        'clientSecret' 	: 'klUd1sMdKE6leVNASuAPfaO5',
        'callbackURL' 	: 'http://127.0.0.1:1000/auth/google/callback'
    },
    'vkontakteAuth' : {
        'clientID' 		: '5273852',
        'clientSecret' 	: 'PsRDIi9SozjJC3ufVJpf',
        'callbackURL' 	: 'http://127.0.0.1:1000/auth/vkontakte/callback'
    }
};

