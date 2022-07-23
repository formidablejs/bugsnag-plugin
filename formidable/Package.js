exports.Package = class Package {
	publish(language = 'imba') {
		const ext = language.toLowerCase() == 'imba'
		  ? 'imba' : (
			language.toLowerCase() == 'typescript' ? 'ts' : 'imba'
		  )

		const configKey = `config/bugsnag.${ext}`;
		const configValue = `./formidable/config/bugsnag.${ext}`;

		return {
			config: {
				paths: {
					[configKey]: configValue
				}
			}
		}
	}
}