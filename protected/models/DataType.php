<?php

class DataType
{

	public static function supportsCollation($dataType)
	{
		return in_array($dataType, array('char', 'varchar', 'smalltext', 'text', 'mediumtext', 'longtext', 'enum', 'set'));
	}

	public static function supportsFulltext($dataType)
	{
		return in_array($dataType, array('char', 'varchar', 'smalltext', 'text', 'mediumtext', 'longtext'));
	}

}

?>