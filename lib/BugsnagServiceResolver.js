function requireDefault$__(obj){
	return obj && obj.__esModule ? obj : { default: obj };
};;
function iter$__(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : []; };
Object.defineProperty(exports, "__esModule", {value: true});

/*body*/
var _$frameworkφ = require('@formidablejs/framework'/*$path$*/);
var _$jsφ = requireDefault$__(require('@bugsnag/js'/*$path$*/));
class BugsnagServiceResolver extends _$frameworkφ.ServiceResolver {
	
	
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
			redactedKeys: this.app.config.get('bugsnag.redacted_keys'),
			releaseStage: this.app.config.get('bugsnag.release_stage',this.app.config.get('app.env')),
			sendCode: this.app.config.get('bugsnag.sendCode')
		};
	}
	
	boot(){
		
		if (!((_$frameworkφ.helpers.isEmpty(this.app.config.get('bugsnag.api_key'))))) {
			
			_$jsφ.default.start(this.config);
			
			this.catchQueries();
			
			this.catchErrors();
		};
		
		_$jsφ.default.registerCallback = function(handler) {
			
			if (_$frameworkφ.helpers.isEmpty(_$jsφ.default._registered_callbacks)) {
				
				_$jsφ.default._registered_callbacks = [];
			};
			
			return _$jsφ.default._registered_callbacks.push(handler);
		};
		
		return this;
	}
	
	catchQueries(){
		var self = this;
		
		return self.app.addHook('onRequest',function(request,reply,done) {
			
			if (self.app.config.get('bugsnag.query',true) == true) {
				
				_$frameworkφ.Database.on('query',function(data) {
					
					if (_$frameworkφ.helpers.isEmpty(request._knex_data)) {
						
						request._knex_data = [];
					};
					
					const today = new Date;
					
					const time = ("" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds() + " " + ((today.getHours() >= 12) ? 'pm' : 'am'));
					
					return request._knex_data.push({
						time: time,
						...data
					});
				});
			};
			
			return done();
		});
	}
	
	/**
	@param {Event} event
	*/
	createQueryTab(request,event){
		
		const knexEvent = request.request._knex_data;
		
		if (knexEvent) {
			
			let queryTab = {};
			
			for (let iφ = 0, itemsφ = iter$__(knexEvent), lenφ = itemsφ.length; iφ < lenφ; iφ++) {
				let query = itemsφ[iφ];
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
		};
	}
	
	/**
	@param {FormRequest} request
	*/
	setUser(request){
		
		if (this.app.config.get('bugsnag.user',false) == true) {
			
			const user = request.auth().user();
			
			if (user) {
				
				return this.event.addMetadata('user',{
					..._$frameworkφ.helpers.without(user,this.app.config.get('auth.providers.jwt.hidden'))
				});
			};
		};
	}
	
	/**
	@param {Event} event
	*/
	handleCallbacks(event){
		var resφ;
		
		if (this.app.config.get('bugsnag.callbacks',false) == true) {
			
			resφ = [];
			for (let iφ2 = 0, itemsφ2 = iter$__(_$jsφ.default._registered_callbacks), lenφ2 = itemsφ2.length; iφ2 < lenφ2; iφ2++) {
				let callback = itemsφ2[iφ2];
				resφ.push(callback(event));
			};
			return resφ;
		};
	}
	
	catchErrors(){
		var self = this;
		
		return self.app.onResponse(function(error,/**@type {FormRequest}*/request) {
			var φ;
			
			if (error instanceof Error) {
				
				if (_$frameworkφ.helpers.isFunction(self.app.handler) && self.app.handler.shouldReport(error)) {
					
					_$jsφ.default.notify(error,function(event) {
						
						event.request = self.requestInformation(request);
						
						self.setUser(request);
						
						self.createQueryTab(request,event);
						
						return self.handleCallbacks(event);
					});
				};
			};
			
			if (request.request._knex_data) {
				
				(((φ = request.request._knex_event),delete request.request._knex_event, φ));
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
