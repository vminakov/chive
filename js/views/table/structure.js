/*
 * View functions
 */
var tableStructure = {
	
	// Add column
	addColumn: function()
	{
		$('#columns').appendForm(baseUrl + '/schema/' + schema + '/tables/' + table + '/columns/create');
	},
	
	// Edit column
	editColumn: function(col)
	{
		$('#columns_' + col).appendForm(baseUrl + '/schema/' + schema + '/tables/' + table + '/columns/update?col=' + col);
	},
	
	// Drop column
	dropColumn: function(col)
	{
		$('#columns input[type="checkbox"]').attr('checked', false).change();
		$('#columns input[type="checkbox"][value="' + col + '"]').attr('checked', true).change();
		tableStructure.dropColumns();
	},
	dropColumns: function()
	{
		if($('#columns input[name="columns[]"]:checked').length > 0) 
		{
			$('#dropColumnsDialog').dialog("open");
		}
	},
	
	// Add index
	newIndexType: null,
	addIndex1: function(type, col)
	{
		$('#columns input[type="checkbox"]').attr('checked', false).change();
		$('#columns input[type="checkbox"][value="' + col + '"]').attr('checked', true).change();
		tableStructure.addIndex(type);
	},
	addIndex: function(type)
	{
		tableStructure.newIndexType = type;
		if($('#columns input[name="columns[]"]:checked').length > 0) 
		{
			// Set default name
			$('#newIndexName').val(tableStructure.getSelectedIds().join('_'));
			// Set type in dialog
			$('#newIndexType').html(type);
			// Show dialog
			$('#addIndexDialog').dialog('open');
		}
	},
	
	// Drop index
	dropIndexName: null,
	dropIndexType: null,
	dropIndex: function(name)
	{
		tableStructure.dropIndexName = name;
		tableStructure.dropIndexType = $('#indices_' + name).children('td:eq(1)').html().trim();
		$('#dropIndexDialog').dialog('open');
	},
	
	// Get selected id's
	getSelectedIds: function()
	{
		var ids = [];
		$('#columns input[name="columns[]"]:checked').each(function() {
			ids.push($(this).val());
		});
		return ids;		
	}
	
};

/*
 * OnLoad
 */
$(document).ready(function() {
	
	/*
	 * Setup sortable columns
	 */
	$('#columns tbody').sortable({
		handle: 'img.icon_arrow_move',
		update: function(event, ui) {
			
			// Fix even/odd classes
			$('#columns tbody tr:even').addClass('even').removeClass('odd');
			$('#columns tbody tr:odd').addClass('odd').removeClass('even');
			
			// Get column id
			var id = ui.item[0].id.substr(8);
			
			// Get position & command
			var prevs = $('#columns_' + id).prevAll();
			if(prevs.length == 0)
			{
				var command = "FIRST";
			}
			else
			{
				var command = "AFTER " + $('#columns_' + id).prev()[0].id.substr(8); 
			}
			
			// Do AJAX request
			$.post(baseUrl + '/schema/' + schema + '/tables/' + table + '/columns/move', {
					command: command,
					column: id
				}
			);
			
		}
	});
	
	/*
	 * Setup sortable indices
	 */
	$('#indices ul').each(function() {
		var obj = $(this);
		if(obj.children('li').length < 2)
		{
			return;
		}
		
		obj.sortable({
			update: function(event, ui) {
				var tr = $(this).closest('tr');
				var ul = $(this).closest('ul');
				var indexName = tr.attr('id').substr(8);
				var indexType = tr.children('td:eq(1)').text().trim();
				
				var columns = new Array();
				ul.children('li').each(function() {
					columns.push(this.id.replace(tr.attr('id') + '_', ''));
				});
				
				// Do AJAX requests
				$.post(baseUrl + '/schema/' + schema + '/tables/' + table + '/alterIndex', {
					index: indexName,
					type: indexType,
					'columns[]': columns
				});
				
			}
		}).css('cursor', 'move');
		
	});
	
	
	/*
	 * Setup drop column dialog
	 */
	$('div.ui-dialog>div[id="dropColumnsDialog"]').remove();
	$('#dropColumnsDialog').dialog({
		modal: true,
		resizable: false,
		autoOpen: false,
		buttons: {
			'No': function() {
				$(this).dialog('close');
			},
			'Yes': function() {
				
				// Collect ids
				var ids = tableStructure.getSelectedIds();
				
				// Do drop request
				$.post(baseUrl + '/schema/' + schema + '/tables/' + table + '/columns/drop', {
					'schema': schema,
					'table': table,
					'column[]': ids
				}, function() {
					for(var i = 0; i < ids.length; i++)
					{
						$('#columns_' + ids[i]).remove();
					}
				});
				
				$(this).dialog('close');
			}
		}		
	});
	
	
	/*
	 * Setup add index dialog
	 */
	$('div.ui-dialog>div[id="addIndexDialog"]').remove();
	$('#addIndexDialog').dialog({
		modal: true,
		resizable: false,
		autoOpen: false,
		dialogClass: 'addIndexDialog',
		buttons: {
			'Ok': function() {
				
				// Collect ids
				var ids = tableStructure.getSelectedIds();
				
				// Do request
				$.post(baseUrl + '/schema/' + schema + '/tables/' + table + '/createIndex', {
					index: $('#newIndexName').get(0).value,
					type: tableStructure.newIndexType,
					'columns[]': ids
				}, function() {
					reload();
				});
				
				$(this).dialog('close');
			},
			'Cancel': function() {
				$(this).dialog('close');
			}
		}		
	});
	
	/*
	 * Setup drop index dialog
	 */
	$('div.ui-dialog>div[id="dropIndexDialog"]').remove();
	$('#dropIndexDialog').dialog({
		modal: true,
		resizable: false,
		autoOpen: false,
		buttons: {
			'Cancel': function() {
				$(this).dialog('close');
			},
			'Ok': function() {
				
				// Do request
				$.post(baseUrl + '/schema/' + schema + '/tables/' + table + '/dropIndex', {
					index: tableStructure.dropIndexName,
					type: tableStructure.dropIndexType
				}, function() {
					$('#indices_' + tableStructure.dropIndexName).remove();
					$('#indices tr').removeClass('even').removeClass('odd');
					$('#indices tbody tr:even').addClass('even');
					$('#indices tbody tr:odd').addClass('odd');
				});
				
				$(this).dialog('close');
			}
		}		
	});
	
});