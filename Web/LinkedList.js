import * from "Node.js";

export class LinkedList
{
	constructor()
	{
		this.head = null;
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
		Removes the node from the list.

		node: The node to remove.
	*/
	remove(node)
	{
		if (this.head == node && this.tail == node)
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