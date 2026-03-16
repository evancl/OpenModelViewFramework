export class Node
{
	/*
		Class constructor.

		value: The value to use.
	*/
	constructor(value)
	{
		// Next node.
		this.next = null;
		// Previous node.
		this.previous = null;
		// Node value.
		this.value = value;
	}
}