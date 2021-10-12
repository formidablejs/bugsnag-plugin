exports.Package = class Package {
	publish() {
		return {
			config: {
				paths: {
					'config/bugsnag.imba': './formidable/config/bugsnag.imba'
				}
			}
		}
	}
}