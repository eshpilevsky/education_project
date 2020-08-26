#!/usr/bin/env node

process.title = 'newedutech';

const config = require('./config/config');
const fs = require('fs');
const http = require('http');
const spdy = require('spdy');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mediasoup = require('mediasoup');
const AwaitQueue = require('awaitqueue');
const Logger = require('./lib/Logger');
const Room = require('./lib/Room');
const Peer = require('./lib/Peer');
const base64 = require('base-64');
const helmet = require('helmet');

const userRoles = require('./userRoles');
const {
	loginHelper,
	logoutHelper
} = require('./httpHelper');
// auth
const passport = require('passport');
const LTIStrategy = require('passport-lti');
const imsLti = require('ims-lti');
const redis = require('redis');
const redisClient = redis.createClient(config.redisOptions);
const { Issuer, Strategy } = require('openid-client');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const sharedSession = require('express-socket.io-session');
const interactiveServer = require('./lib/interactiveServer');
const promExporter = require('./lib/promExporter');
const { v4: uuidv4 } = require('uuid');

/* eslint-disable no-console */
console.log('- process.env.DEBUG:', process.env.DEBUG);
console.log('- config.mediasoup.worker.logLevel:', config.mediasoup.worker.logLevel);
console.log('- config.mediasoup.worker.logTags:', config.mediasoup.worker.logTags);
/* eslint-enable no-console */

const logger = new Logger();

const queue = new AwaitQueue();

let statusLogger = null;

if ('StatusLogger' in config)
	statusLogger = new config.StatusLogger();

const mediasoupWorkers = [];

const rooms = new Map();

const peers = new Map();

const tls =
{
	cert          : fs.readFileSync(config.tls.cert),
	key           : fs.readFileSync(config.tls.key),
	secureOptions : 'tlsv12',
	ciphers       :
	[
		'ECDHE-ECDSA-AES128-GCM-SHA256',
		'ECDHE-RSA-AES128-GCM-SHA256',
		'ECDHE-ECDSA-AES256-GCM-SHA384',
		'ECDHE-RSA-AES256-GCM-SHA384',
		'ECDHE-ECDSA-CHACHA20-POLY1305',
		'ECDHE-RSA-CHACHA20-POLY1305',
		'DHE-RSA-AES128-GCM-SHA256',
		'DHE-RSA-AES256-GCM-SHA384'
	].join(':'),
	honorCipherOrder : true
};

const app = express();

app.use(helmet.hsts());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const session = expressSession({
	secret            : config.cookieSecret,
	name              : config.cookieName,
	resave            : true,
	saveUninitialized : true,
	store             : new RedisStore({ client: redisClient }),
	cookie            : {
		secure   : true,
		httpOnly : true,
		maxAge   : 60 * 60 * 1000
	}
});

if (config.trustProxy)
{
	app.set('trust proxy', config.trustProxy);
}

app.use(session);

passport.serializeUser((user, done) =>
{
	done(null, user);
});

passport.deserializeUser((user, done) =>
{
	done(null, user);
});

let mainListener;
let io;
let oidcClient;
let oidcStrategy;

async function run()
{
	try
	{
		await interactiveServer(rooms, peers);

		if (config.prometheus)
		{
			await promExporter(rooms, peers, config.prometheus);
		}

		if (typeof(config.auth) === 'undefined')
		{
			logger.warn('Auth is not configured properly!');
		}
		else
		{
			await setupAuth();
		}

		await runMediasoupWorkers();

		await runHttpsServer();

		await runWebSocketServer();

		const errorHandler = (err, req, res) =>
		{
			const trackingId = uuidv4();

			res.status(500).send(
				`<h1>Internal Server Error</h1>
				<p>If you report this error, please also report this 
				<i>tracking ID</i> which makes it possible to locate your session
				in the logs which are available to the system administrator: 
				<b>${trackingId}</b></p>`
			);
			logger.error(
				'Express error handler dump with tracking ID: %s, error dump: %o',
				trackingId, err);
		};

		// eslint-disable-next-line no-unused-vars
		app.use(errorHandler);
	}
	catch (error)
	{
		logger.error('run() [error:"%o"]', error);
	}
}

function statusLog()
{
	if (statusLogger)
	{
		statusLogger.log({
			rooms : rooms,
			peers : peers
		});
	}
}

function setupLTI(ltiConfig)
{

	ltiConfig.nonceStore = new imsLti.Stores.RedisStore(ltiConfig.consumerKey, redisClient);
	ltiConfig.passReqToCallback= true;

	const ltiStrategy = new LTIStrategy(
		ltiConfig,
		(req, lti, done) =>
		{
			if (lti)
			{
				const user = {};

				if (lti.user_id && lti.custom_room)
				{
					user.id = lti.user_id;
					user._userinfo = { 'lti': lti };
				}

				if (lti.custom_room)
				{
					user.room = lti.custom_room;
				}
				else
				{
					user.room = '';
				}
				if (lti.lis_person_name_full)
				{
					user.displayName = lti.lis_person_name_full;
				}

				return done(null, user);

			}
			else
			{
				return done('LTI error');
			}

		}
	);

	passport.use('lti', ltiStrategy);
}

function setupOIDC(oidcIssuer)
{

	oidcClient = new oidcIssuer.Client(config.auth.oidc.clientOptions);

	/* eslint-disable camelcase */
	const params = (({
		client_id,
		redirect_uri,
		scope
	}) => ({
		client_id,
		redirect_uri,
		scope
	}))(config.auth.oidc.clientOptions);
	/* eslint-enable camelcase */

	const passReqToCallback = false;

	const usePKCE = false;

	oidcStrategy = new Strategy(
		{ client: oidcClient, params, passReqToCallback, usePKCE },
		(tokenset, userinfo, done) =>
		{
			if (userinfo && tokenset)
			{
				// eslint-disable-next-line camelcase
				userinfo._tokenset_claims = tokenset.claims();
			}

			const user =
			{
				id        : tokenset.claims.sub,
				provider  : tokenset.claims.iss,
				_userinfo : userinfo
			};

			return done(null, user);
		}
	);

	passport.use('oidc', oidcStrategy);
}

async function setupAuth()
{
	if (
		typeof(config.auth.lti) !== 'undefined' &&
		typeof(config.auth.lti.consumerKey) !== 'undefined' &&
		typeof(config.auth.lti.consumerSecret) !== 'undefined'
	) 	setupLTI(config.auth.lti);


	if (
		typeof(config.auth.oidc) !== 'undefined' &&
		typeof(config.auth.oidc.issuerURL) !== 'undefined' &&
		typeof(config.auth.oidc.clientOptions) !== 'undefined'
	)
	{
		const oidcIssuer = await Issuer.discover(config.auth.oidc.issuerURL);

		setupOIDC(oidcIssuer);

	}

	app.use(passport.initialize());
	app.use(passport.session());

	app.get('/auth/login', (req, res, next) =>
	{
		passport.authenticate('oidc', {
			state : base64.encode(JSON.stringify({
				peerId : req.query.peerId,
				roomId : req.query.roomId
			}))
		})(req, res, next);
	});

	app.post('/auth/lti',
		passport.authenticate('lti', { failureRedirect: '/' }),
		(req, res) =>
		{
			res.redirect(`/${req.user.room}`);
		}
	);

	app.get('/auth/logout', (req, res) =>
	{
		const { peerId } = req.session;

		const peer = peers.get(peerId);

		if (peer)
		{
			for (const role of peer.roles)
			{
				if (role !== userRoles.NORMAL)
					peer.removeRole(role);
			}
		}

		req.logout();
		req.session.destroy(() => res.send(logoutHelper()));
	});

	app.get(
		'/auth/callback',
		passport.authenticate('oidc', { failureRedirect: '/auth/login' }),
		async (req, res, next) =>
		{
			try
			{
				const state = JSON.parse(base64.decode(req.query.state));

				const { peerId, roomId } = state;

				req.session.peerId = peerId;
				req.session.roomId = roomId;

				let peer = peers.get(peerId);

				if (!peer) // User has no socket session yet, make temporary
					peer = new Peer({ id: peerId, roomId });

				if (peer.roomId !== roomId) // The peer is mischievous
					throw new Error('peer authenticated with wrong room');

				if (typeof config.userMapping === 'function')
				{
					await config.userMapping({
						peer,
						roomId,
						userinfo : req.user._userinfo
					});
				}

				peer.authenticated = true;

				res.send(loginHelper({
					displayName : peer.displayName,
					picture     : peer.picture
				}));
			}
			catch (error)
			{
				return next(error);
			}
		}
	);
}

async function runHttpsServer()
{
	app.use(compression());

	app.use('/.well-known/acme-challenge', express.static('public/.well-known/acme-challenge'));

	app.all('*', async (req, res, next) =>
	{
		if (req.secure || config.httpOnly)
		{
			let ltiURL;

			try
			{
				ltiURL = new URL(`${req.protocol }://${ req.get('host') }${req.originalUrl}`);
			}
			catch (error)
			{
				logger.error('Error parsing LTI url: %o', error);
			}

			if (
				req.isAuthenticated &&
				req.user &&
				req.user.displayName &&
				!ltiURL.searchParams.get('displayName') &&
				!isPathAlreadyTaken(req.url)
			)
			{

				ltiURL.searchParams.append('displayName', req.user.displayName);

				res.redirect(ltiURL);
			}
			else
				return next();
		}
		else
			res.redirect(`https://${req.hostname}${req.url}`);

	});

	app.use(express.static('public'));

	app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

	if (config.httpOnly === true)
	{
		mainListener = http.createServer(app);
	}
	else
	{
		mainListener = spdy.createServer(tls, app);

		const redirectListener = http.createServer(app);

		if (config.listeningHost)
			redirectListener.listen(config.listeningRedirectPort, config.listeningHost);
		else
			redirectListener.listen(config.listeningRedirectPort);
	}

	if (config.listeningHost)
		mainListener.listen(config.listeningPort, config.listeningHost);
	else
		mainListener.listen(config.listeningPort);
}

function isPathAlreadyTaken(url)
{
	const alreadyTakenPath =
	[
		'/config/',
		'/static/',
		'/images/',
		'/sounds/',
		'/favicon.',
		'/auth/'
	];

	alreadyTakenPath.forEach((path) =>
	{
		if (url.toString().startsWith(path))
			return true;
	});

	return false;
}

async function runWebSocketServer()
{
	io = require('socket.io')(mainListener);

	io.use(
		sharedSession(session, {
			autoSave : true
		})
	);

	io.on('connection', (socket) =>
	{
		const { roomId, peerId } = socket.handshake.query;

		if (!roomId || !peerId)
		{
			logger.warn('connection request without roomId and/or peerId');

			socket.disconnect(true);

			return;
		}

		logger.info(
			'connection request [roomId:"%s", peerId:"%s"]', roomId, peerId);

		queue.push(async () =>
		{
			const { token } = socket.handshake.session;

			const room = await getOrCreateRoom({ roomId });

			let peer = peers.get(peerId);
			let returning = false;

			if (peer && !token)
			{
				socket.disconnect(true);

				return;
			}
			else if (token && room.verifyPeer({ id: peerId, token }))
			{
				if (peer)
					peer.close();

				returning = true;
			}

			peer = new Peer({ id: peerId, roomId, socket });

			peers.set(peerId, peer);

			peer.on('close', () =>
			{
				peers.delete(peerId);

				statusLog();
			});

			if (
				Boolean(socket.handshake.session.passport) &&
				Boolean(socket.handshake.session.passport.user)
			)
			{
				const {
					id,
					displayName,
					picture,
					email,
					_userinfo
				} = socket.handshake.session.passport.user;

				peer.authId = id;
				peer.displayName = displayName;
				peer.picture = picture;
				peer.email = email;
				peer.authenticated = true;

				if (typeof config.userMapping === 'function')
				{
					await config.userMapping({ peer, roomId, userinfo: _userinfo });
				}
			}

			room.handlePeer({ peer, returning });

			statusLog();
		})
			.catch((error) =>
			{
				logger.error('room creation or room joining failed [error:"%o"]', error);

				if (socket)
					socket.disconnect(true);

				return;
			});
	});
}

async function runMediasoupWorkers()
{
	const { numWorkers } = config.mediasoup;

	logger.info('running %d mediasoup Workers...', numWorkers);

	for (let i = 0; i < numWorkers; ++i)
	{
		const worker = await mediasoup.createWorker(
			{
				logLevel   : config.mediasoup.worker.logLevel,
				logTags    : config.mediasoup.worker.logTags,
				rtcMinPort : config.mediasoup.worker.rtcMinPort,
				rtcMaxPort : config.mediasoup.worker.rtcMaxPort
			});

		worker.on('died', () =>
		{
			logger.error(
				'mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);

			setTimeout(() => process.exit(1), 2000);
		});

		mediasoupWorkers.push(worker);
	}
}

async function getOrCreateRoom({ roomId })
{
	let room = rooms.get(roomId);

	// If the Room does not exist create a new one.
	if (!room)
	{
		logger.info('creating a new Room [roomId:"%s"]', roomId);

		// const mediasoupWorker = getMediasoupWorker();

		room = await Room.create({ mediasoupWorkers, roomId });

		rooms.set(roomId, room);

		statusLog();

		room.on('close', () =>
		{
			rooms.delete(roomId);

			statusLog();
		});
	}

	return room;
}

run();
