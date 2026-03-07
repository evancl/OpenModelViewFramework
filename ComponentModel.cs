namespace OpenModelViewLibrary;

class ComponentModel
{
	// Identifier for geometry data.
	short ID
	{
		get; set
        {
            if (value < 0)
                throw new ArgumentOutOfRangeException("ComponentModel.ID must be greater than or equal to 0.");
        }
	}
	// Geometry data.
	byte[] Data
	{
		get; set
		{
			if (value == null)
				throw new ArgumentNullException("ComponentModel.Data cannot be null.");
			else if (value.Length % 72 != 0 || value.Length > int.MaxValue)
				throw new ArgumentOutOfRangeException($"ComponentModel.Data length must be a multiple of 72 and less than {int.MaxValue}.");
		}
	}
	/*
        Gets the binary representation of the component data file.

        data: The binary representation.
    */
	void GetBinaryRep(List<byte> data)
	{
		data.AddRange(GetBytes(ID));
		data.AddRange(Data);
	}
}