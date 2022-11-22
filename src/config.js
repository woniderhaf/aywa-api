// config

module.exports = {
  ENV: process.env.NODE_ENV || 'development',

  PORT: process.env.PORT || 8080,
  URL: process.env.BASE_URL || 'http://localhost:8080',

  MONGODB_URI: 'mongodb://localhost:27017/aywa', //'mongodb//user:password@hosturl/databasename',

  JWT: {
    TTL: process.env.TTL || '24h',
    SECRET: process.env.JWT_SECRET || 'supersecretkey',
  },

  SMS: {
    URL: 'https://api.iqsms.ru/messages/v2/send/',
    PORT: 80,
    LOGIN: 'z1644866451703',
    PASS: '688991',
    PHONES: ['79172625453', '79869170593'],
    DEFCODE: '0000',
  },
}

/*

define('__SMS_API_URL',			'gate.iqsms.ru');
define('__SMS_API_PORT',		80);
define('__SMS_LOGIN',			'z1570798201478');
define('__SMS_PASSWORD',		'706108');
define('__SMS_SENDER',			'KF');
define('__SMS_WAPURL',			'');


module.exports = {
	ports		: {
		server	: 3000,
		chat	: 3010
	},
	connection 	: 'mongodb://localhost:27017/',
	database	: 'rudating',
	secret		: 'SECRET',
	jwtTTL		: '24h',
	routes		: ['users']



		connection 	: 'mongodb://localhost:27017/',
	database	: 'rudating',
	secret		: 'SECRET',
	jwtTTL		: '24h',
	routes		: ['users']
};

*/
