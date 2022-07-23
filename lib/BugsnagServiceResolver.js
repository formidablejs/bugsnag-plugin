function requireDefault$__(obj){
	return obj && obj.__esModule ? obj : { default: obj };
};;
function iter$__(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : a; };
Object.defineProperty(exports, "__esModule", {value: true});

/*body*/
var $1 = require('@formidablejs/framework'/*$path$*/);
var $2 = require('@formidablejs/framework'/*$path$*/);
var $3 = require('@formidablejs/framework'/*$path$*/);
var $4 = require('@formidablejs/framework'/*$path$*/);
var $5 = requireDefault$__(require('@bugsnag/js'/*$path$*/));

class BugsnagServiceResolver extends $4.ServiceResolver {
	
	
	get config(){
		
		return {
			apiKey: this.app.config.get('bugsnag.api_key'),
			appType: this.app.config.get('bugsnag.app_type'),
			appVersion: this.app.config.get('bugsnag.app_version'),
			enabledReleaseStages: this.app.config.get('bugsnag.notify_release_stages'),
			endpoints: {
				notify: this.app.config.get('bugsnag.endpoint','https://notify.bugsnag.com'),
				sessions: 'https://sessions.bugsnag.com'
			},
			hostname: this.app.config.get('bugsnag.hostname'),
			projectRoot: this.app.config.get('bugsnag.project_root'),
			redactedKeys: this.app.config.get('bugsnag.redacted_keys',[
				'password',
				'cookie',
				'authorization'
			]),
			releaseStage: this.app.config.get('bugsnag.release_stage',this.app.config.get('app.env')),
			sendCode: this.app.config.get('bugsnag.sendCode',true),
			logger: null
		};
	}
	
	boot(){
		
		if (!(($3.helpers.isEmpty(this.app.config.get('bugsnag.api_key'))))) {
			
			$5.default.start(this.config);
			
			this.catchQueries();
			
			this.catchErrors();
		};
		
		$5.default.registerCallback = function(handler) {
			
			if ($3.helpers.isEmpty($5.default._registered_callbacks)) {
				
				$5.default._registered_callbacks = [];
			};
			
			return $5.default._registered_callbacks.push(handler);
		};
		
		return this;
	}
	
	catchQueries(){
		var self = this;
		
		return self.app.addHook('onRequest',function(request,reply,done) {
			
			if (self.app.config.get('bugsnag.query',true) !== true) { return done() };
			
			$1.Database.on('query',function(data) {
				
				if ($3.helpers.isEmpty(request._knex_data)) {
					
					request._knex_data = [];
				};
				
				const today = new Date;
				
				const hh = today.getHours();
				const mm = today.getMinutes();
				const ss = today.getSeconds();
				const ms = today.getMilliseconds();
				
				const time = ("" + hh + ":" + mm + ":" + ss + ":" + ms + " " + ((hh >= 12) ? 'pm' : 'am'));
				
				return request._knex_data.push({
					time: time,
					...data
				});
			});
			
			return done();
		});
	}
	
	/**
	@param {Event} event
	*/
	createQueryTab(request,event){
		
		const knexEvent = request.request._knex_data;
		
		if (!knexEvent) { return };
		
		let queryTab = {};
		
		for (let $6 = 0, $7 = iter$__(knexEvent), $8 = $7.length; $6 < $8; $6++) {
			let query = $7[$6];
			const queryLog = {
				[query.time]: {
					method: query.method,
					sql: query.sql
				}
			};
			
			if (this.app.config.get('bugsnag.bindings',false) == true) {
				
				queryLog.bindings = query.bindings;
			};
			
			queryTab = {...queryTab,...queryLog};
		};
		
		return event.addMetadata('Query',queryTab);
	}
	
	/**
	@param {FormRequest} request
	*/
	setUser(request){
		
		if (this.app.config.get('bugsnag.user',false) !== true) { return };
		
		const user = request.auth().user();
		
		if (!user) { return };
		
		return this.event.addMetadata('user',{
			...$3.helpers.without(user,this.app.config.get('auth.providers.jwt.hidden'))
		});
	}
	
	/**
	@param {Event} event
	*/
	handleCallbacks(event){
		var $9;
		
		if (this.app.config.get('bugsnag.callbacks',false) !== true) { return };
		
		$9 = [];
		for (let $10 = 0, $11 = iter$__($5.default._registered_callbacks), $12 = $11.length; $10 < $12; $10++) {
			let callback = $11[$10];
			$9.push(callback(event));
		};
		return $9;
	}
	
	catchErrors(){
		var self = this;
		
		return self.app.onResponse(function(error,/**@type {FormRequest}*/request) {
			var $13;
			
			if (error instanceof Error) {
				
				if (!($3.helpers.isEmpty(self.app.handler)) && self.app.handler.shouldReport(error)) {
					
					$5.default.notify(error,function(event) {
						
						event.request = self.requestInformation(request);
						
						self.setUser(request);
						
						self.createQueryTab(request,event);
						
						self.handleCallbacks(event);
						
						event.severity = 'error';
						
						event.unhandled = false;
						
						return event;
					});
				};
			};
			
			if (request.request._knex_data) {
				
				((($13 = request.request._knex_event),delete request.request._knex_event, $13));
			};
			
			return null;
		});
	}
	
	/**
	@param {FormRequest} request
	*/
	requestInformation(request){
		
		const req = request.request;
		
		const connection = req.raw.connection;
		const address = connection && connection.address && connection.address();
		const portNumber = address && address.port;
		const port = (!portNumber || portNumber === 80 || portNumber === 443) ? '' : ((":" + portNumber));
		const protocol = (typeof req.protocol !== 'undefined') ? req.protocol : ((req.connection.encrypted ? 'https' : 'http'));
		const hostname = (req.hostname || req.headers.host).replace(/:\d+$/,'');
		const url = ("" + protocol + "://" + hostname + port + (req.url));
		
		const object = {
			url: url,
			path: request.urlWithoutQuery(),
			httpMethod: request.method(),
			headers: request.headers(),
			httpVersion: req.raw.httpVersion,
			params: request.params(),
			query: request.query(),
			body: request.body()
		};
		
		object.clientIp = req.ip || undefined;
		object.referer = req.headers.referer || req.headers.referrer;
		
		if (connection) {
			
			object.connection = {
				remoteAddress: connection.remoteAddress,
				remotePort: connection.remotePort,
				bytesRead: connection.bytesRead,
				bytesWritten: connection.bytesWritten,
				localPort: portNumber,
				localAddress: address ? address.address : undefined,
				IPVersion: address ? address.family : undefined
			};
		};
		
		return object;
	}
};
exports.default = BugsnagServiceResolver;
