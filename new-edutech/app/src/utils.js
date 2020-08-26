export const idle = (callback, delay) =>
{
	let handle;

	return () =>
	{
		if (handle)
		{
			clearTimeout(handle);
		}

		handle = setTimeout(callback, delay);
	};
};

export class SocketTimeoutError extends Error
{
	constructor(message)
	{
		super(message);

		this.name = 'SocketTimeoutError';

		if (Error.hasOwnProperty('captureStackTrace')) // Just in V8.
			Error.captureStackTrace(this, SocketTimeoutError);
		else
			this.stack = (new Error(message)).stack;
	}
}
