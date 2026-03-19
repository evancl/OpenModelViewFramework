class LinkedList
{
	constructor()
	{
		// Head node.
		this.head = null;
		// Tail node.
		this.tail = null;
	}
	/*
		Adds a new node to the list.

		value: The value to add.
	*/
	add(value)
	{
		const node = new Node(value);
		if (this.head == null)
		{
			this.head = node;
			this.tail = node;
		}
		else
		{
			node.previous = this.tail;
			this.tail.next = node;
			this.tail = node;
		}
	}
	/*
		Removes the node with the given value from the list.

		value: The value that indicates which node to remove.
	*/
	remove(value)
	{
		if (this.head == null)
			return;
		let node = this.head;
		while (node != null)
		{
			if (node.value = value)
				break;
			node = node.next;
		}
		if (node == null)
			return;
		else if (this.head == node && this.tail == node)
		{
			this.head = null;
			this.tail = null;
		}
		else if (this.head == node)
		{
			this.head = this.head.next;
			this.head.previous = null;
		}
		else if (this.tail == node)
		{
			this.tail = this.tail.previous;
			this.tail.next = null;
		}
		else
		{
			node.previous.next = node.next;
			node.next.previous = node.previous;
		}
	}
}