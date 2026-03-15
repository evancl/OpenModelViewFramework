export class Node
{
	/*
		Class constructor.

		value: The value to use.
	*/
	constructor(value)
	{
		this.next = null;
		this.previous = null;
		this.value = value;
	}
}