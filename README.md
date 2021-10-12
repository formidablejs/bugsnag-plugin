# Bugsnag Plugin

Bugsnag notifier for the Formidable framework (work in progress).

## Requirements

 * [@formidablejs/craftsman](https://www.npmjs.com/package/@formidablejs/craftsman): `>=0.5.0-alpha.3`
 * [@formidablejs/framework](https://www.npmjs.com/package/@formidablejs/framework): `>=0.5.0-alpha.1`
 * [@bugsnag/js](https://github.com/bugsnag/bugsnag-js) `>=7.11.0`

## Publish

```bash
craftsman publish --package=@formidablejs/bugsnag-plugin --tag=config
```

## Config

Add `BugsnagServiceResolver` in the `config/app.imba` config under `resolvers`:

```js
...

resolvers: {
	...
	require('@formidablejs/bugsnag-plugin').BugsnagServiceResolver
```

> Note, the `BugsnagServiceResolver` must be at the top of the `resolvers` list.

Then, register the `bugsnag.imba` config file in the `config/index.imba` file:

```py
...
import bugsnag from './bugsnag'

export class Config < ConfigRepository

	# All of the configuration items.
	#
	# @type {Object}

	get registered
		{
			...
			bugsnag
		}
```

And finally set your api key in the `.env` file:

```env
BUGSNAG_API_KEY=<your-api-key>
```

Security
-------

If you discover any security related issues, please email donaldpakkies@gmail.com instead of using the issue tracker.

License
-------

The MIT License (MIT). Please see [License File](LICENSE) for more information.
