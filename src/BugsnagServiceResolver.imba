import { ServiceResolver, Database, helpers } from '@formidablejs/framework'
import Bugsnag from '@bugsnag/js'
import type { Event } from '@bugsnag/js'
import type { FastifyRequest, FormRequest } from '@formidablejs/framework'

export default class BugsnagServiceResolver < ServiceResolver

	get config
		{
			apiKey: self.app.config.get('bugsnag.api_key')
			appType: self.app.config.get('bugsnag.app_type')
			appVersion: self.app.config.get('bugsnag.app_version')
			enabledReleaseStages: self.app.config.get('bugsnag.notify_release_stages')
			endpoints: {
				notify: self.app.config.get('bugsnag.endpoint', 'https://notify.bugsnag.com')
				sessions: 'https://sessions.bugsnag.com'
			}
			hostname: self.app.config.get('bugsnag.hostname')
			projectRoot: self.app.config.get('bugsnag.project_root')
			redactedKeys: self.app.config.get('bugsnag.redacted_keys')
			releaseStage: self.app.config.get('bugsnag.release_stage', self.app.config.get('app.env'))
			sendCode: self.app.config.get('bugsnag.sendCode')
		}

	def boot
		if !(helpers.isEmpty(self.app.config.get('bugsnag.api_key')))
			Bugsnag.start config

			self.catchQueries!

			self.catchErrors!

		Bugsnag.registerCallback = do(handler)
			if helpers.isEmpty(Bugsnag._registered_callbacks)
				Bugsnag._registered_callbacks = [  ]

			Bugsnag._registered_callbacks.push handler

		this

	def catchQueries
		self.app.addHook 'onRequest', do(request, reply, done)
			if self.app.config.get('bugsnag.query', true) == true
				Database.on 'query', do(data)
					if helpers.isEmpty(request._knex_data)
						request._knex_data = [  ]

					const today = new Date

					const time = "{today.getHours!}:{today.getMinutes!}:{today.getSeconds!}:{today.getMilliseconds!} {today.getHours! >= 12 ? 'pm' : 'am'}"

					request._knex_data.push {
						time,
						...data
					}

			done!

	def createQueryTab request, event\Event
		const knexEvent = request.request._knex_data

		if knexEvent
			let queryTab = { }

			for query in knexEvent
				const queryLog = {
					[query.time]: {
						method: query.method
						sql: query.sql
					}
				}

				if self.app.config.get('bugsnag.bindings', false) == true
					queryLog.bindings = query.bindings

				queryTab = { ...queryTab, ...queryLog }

			event.addMetadata 'Query', queryTab

	def setUser request\FormRequest
		if self.app.config.get('bugsnag.user', false) == true
			const user = request.auth!.user!

			if user
				event.addMetadata 'user', {
					...helpers.without(user, self.app.config.get('auth.providers.jwt.hidden'))
				}

	def handleCallbacks event\Event
		if self.app.config.get('bugsnag.callbacks', false) == true
			for callback in Bugsnag._registered_callbacks
				callback event

	def catchErrors
		self.app.onResponse do(error, request\FormRequest)
			if error instanceof Error
				Bugsnag.notify error, do(event)
					event.request = self.requestInformation(request)

					self.setUser request

					self.createQueryTab request, event

					self.handleCallbacks event

			if request.request._knex_data
				delete request.request._knex_event

			null

	def requestInformation request\FormRequest
		const req\FastifyRequest = request.request

		const connection = req.raw.connection
		const address = connection && connection.address && connection.address!
		const portNumber = address && address.port
		const port = ( !portNumber || portNumber === 80 || portNumber === 443 ) ? '' : ":{portNumber}"
		const protocol = typeof req.protocol !== 'undefined' ? req.protocol : ( req.connection.encrypted ? 'https' : 'http' )
		const hostname = (req.hostname || req.headers.host).replace(/:\d+$/, '')
		const url = "{protocol}://{hostname}{port}{req.url}"

		const object = {
			url: url
			path: request.urlWithoutQuery!
			httpMethod: request.method!
			headers: request.headers!
			httpVersion: req.raw.httpVersion
			params: request.params!
			query: request.query!
			body: request.body!
		}

		object.clientIp = req.ip || undefined
		object.referer = req.headers.referer || req.headers.referrer

		if connection
			object.connection = {
				remoteAddress: connection.remoteAddress
				remotePort: connection.remotePort
				bytesRead: connection.bytesRead
				bytesWritten: connection.bytesWritten
				localPort: portNumber
				localAddress: address ? address.address : undefined
				IPVersion: address ? address.family : undefined
			}

		object
