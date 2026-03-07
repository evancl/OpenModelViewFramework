namespace OpenModelViewLibrary;

class ComponentProperties
{
	string Path;
	byte UpdatedProperties;
	bool IsHidden;
	short ID;
	byte[] Properties;
	float[] Transform;

	void GetBinaryRep(List<byte> data)
	{
		data.AddRange(GetBytes(ID));
		data.AddRange(Data);
	}
}