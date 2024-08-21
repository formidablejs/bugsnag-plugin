import { PersonalAccessToken } from '@formidablejs/framework'
import isEmpty from '@formidablejs/framework/lib/Support/Helpers/isEmpty'
import type { Request, FormRequest } from '@formidablejs/framework'

export class Auth

	def isAuthenticated request\FormRequest|Request
		request.hasHeader('authorization') || !isEmpty(request.session().get('personal_access_token'))

	def getPersonalAccessToken request\FormRequest|Request
		if request.hasHeader('authorization') then return request.bearerToken!

		request.session().get('personal_access_token')

	def get request\FormRequest|Request
		if self.isAuthenticated(request)
			const token = await PersonalAccessToken.find( self.getPersonalAccessToken(request) )

			if isEmpty(token.token) && isEmpty(token.tokenable)
				return null

			request.session().forget('personal_access_token')

			return token.tokenable

		null
