$.extend($.fn.datagrid.defaults, {
	groupHeight: 28,
	expanderWidth: 30,
	groupStyler: function(value,rows){return ''}
});

var groupview = $.extend({}, $.fn.datagrid.defaults.view, {
	render: function(target, container, frozen){
		var table = [];
		var tb_multi = [];
		var groupsParent = this.groupsParent;
		var groups = this.groups;

		var parent = [];
		for (var iGP = 0; iGP < groupsParent.length; iGP++) {
			/* pembentukan grouper level 1 */
			parent.push({
					parent : groupsParent[iGP]
			});
		}

		for(var iG = 0; iG < groups.length; iG++){

				for (var iGP = 0; iGP < parent.length; iGP++) {
						/* multi grouper */
						if (parent[iGP].parent.value == groups[iG].valueParent) {
								var html = this.renderGroup.call(this, target, iG, groups[iG], frozen, iGP);
								tb_multi.push({
										groupParent : groups[iG].valueParent,
										htmlChild : html
								});

						}
				}

				if (parent == 0) {
						/* singgle grouper */
						table.push(this.renderGroup.call(this, target, iG, groups[iG], frozen));
				}
		}

		if (tb_multi.length > 0) {
				var html = "";
				for (var iGP = 0; iGP < groupsParent.length; iGP++) {
						html += this.renderGroupparent.call(this, target, iGP, groupsParent[iGP], frozen)
						var htmlChild = "";
						for (var iMulti = 0; iMulti < tb_multi.length; iMulti++) {
								if (groupsParent[iGP].value == tb_multi[iMulti].groupParent) {
										htmlChild += tb_multi[iMulti].htmlChild
								}

						}
						html += htmlChild;
				}
				table.push(html)
		}

		$(container).html(table.join(''));
	},

	renderGroupparent : function (target, groupIndex, group, frozen, htmlChild) {
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var fields = $(target).datagrid('getColumnFields', frozen);
		var hasFrozen = opts.frozenColumns && opts.frozenColumns.length;

		if (frozen){
			if (!(opts.rownumbers || hasFrozen)){
				return '';
			}
		}

		var table = [];
		/* level 1 */
		table.push('<div gp-header="' + groupIndex + '" class="datagrid-group group-level1">');
		if ((frozen && (opts.rownumbers || opts.frozenColumns.length)) ||
		(!frozen && !(opts.rownumbers || opts.frozenColumns.length))){
			table.push('<span class="datagrid-group-expander group-header">');
			table.push('<span gp-span="' + groupIndex + '" class="datagrid-row-expander datagrid-row-collapse">&nbsp;</span>');
			table.push('</span>');
		}

		if ((frozen && hasFrozen) || (!frozen)){
			table.push('<span class="datagrid-group-title">');
			table.push(opts.groupFormatter.call(target, group.value, [], group.rows));
			table.push('</span>');
		}
		table.push('</div>');
		return table.join('');
	},

	renderGroup: function(target, groupIndex, group, frozen, gpIndex){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var fields = $(target).datagrid('getColumnFields', frozen);
		var hasFrozen = opts.frozenColumns && opts.frozenColumns.length;

		if (frozen){
			if (!(opts.rownumbers || hasFrozen)){
				return '';
			}
		}

		var table = [];

		var css = opts.groupStyler.call(target, group.value, group.rows);
		if (group.valueParent == undefined) {
			var css = opts.groupStyler.call(target, group.value, group.rows);
			var cs = parseCss(css, 'datagrid-group');

			table.push('<div group-index=' + groupIndex + ' ' + cs + '>');

			if ((frozen && (opts.rownumbers || opts.frozenColumns.length)) ||
			(!frozen && !(opts.rownumbers || opts.frozenColumns.length))){
				table.push('<span class="datagrid-group-expander">');
				table.push('<span class="datagrid-row-expander datagrid-row-collapse">&nbsp;</span>');
				table.push('</span>');
			}

			if ((frozen && hasFrozen) || (!frozen)){
				table.push('<span class="datagrid-group-title">');
				table.push(opts.groupFormatter.call(target, group.value, group.rows));
				table.push('</span>');
			}

			table.push('</div>');
		} else {
			var css = opts.groupStyler.call(target, group.value, group.rows);
			var cs = parseCss(css, 'datagrid-group');

      table.push('<div gp-index="' + gpIndex + '" group-index=' + groupIndex + ' ' + cs + '>');
			if ((frozen && (opts.rownumbers || opts.frozenColumns.length)) ||
			(!frozen && !(opts.rownumbers || opts.frozenColumns.length))){
				table.push('<span>&nbsp</span>');
				table.push('<span>&nbsp</span>');
				table.push('<span>&nbsp</span>');
				table.push('<span>&nbsp</span>');
				table.push('<span>&nbsp</span>');
				table.push('<span>&nbsp</span>');
				table.push('<span class="datagrid-group-expander">');
				table.push('<span class="datagrid-row-expander datagrid-row-collapse">&nbsp;</span>');
				table.push('</span>');
			}

			if ((frozen && hasFrozen) || (!frozen)){
				table.push('<span class="datagrid-group-title">');
				table.push(opts.groupFormatter.call(target, group.value, group.rows));
				table.push('</span>');
			}
			table.push('</div>');
		}

		table.push('<table gp-index="' + gpIndex + '" class="datagrid-btable" cellspacing="0" cellpadding="0" border="0"><tbody>');
		var index = group.startIndex;
		for(var j=0; j<group.rows.length; j++) {
			var css = opts.rowStyler ? opts.rowStyler.call(target, index, group.rows[j]) : '';
			var classValue = '';
			var styleValue = '';
			if (typeof css == 'string'){
				styleValue = css;
			} else if (css){
				classValue = css['class'] || '';
				styleValue = css['style'] || '';
			}

			var cls = 'class="datagrid-row ' + (index % 2 && opts.striped ? 'datagrid-row-alt ' : ' ') + classValue + '"';
			var style = styleValue ? 'style="' + styleValue + '"' : '';
			var rowId = state.rowIdPrefix + '-' + (frozen?1:2) + '-' + index;
			table.push('<tr id="' + rowId + '" datagrid-row-index="' + index + '" ' + cls + ' ' + style + '>');
			table.push(this.renderRow.call(this, target, fields, frozen, index, group.rows[j]));
			table.push('</tr>');
			index++;
		}
		table.push('</tbody></table>');
		return table.join('');

		function parseCss(css, cls){
			var classValue = '';
			var styleValue = '';
			if (typeof css == 'string'){
				styleValue = css;
			} else if (css){
				classValue = css['class'] || '';
				styleValue = css['style'] || '';
			}
			return 'class="' + cls + (classValue ? ' '+classValue : '') + '" ' +
					'style="' + styleValue + '"';
		}
	},

	bindEvents: function(target){
		var state = $.data(target, 'datagrid');
		var dc = state.dc;
		var body = dc.body1.add(dc.body2);
		var clickHandler = ($.data(body[0],'events')||$._data(body[0],'events')).click[0].handler;
		/* event onclick pada icon (-/+) */
		body.unbind('click').bind('click', function(e){
			var tt = $(e.target);
			var expander = tt.closest('span.datagrid-row-expander');
			if (expander.length){
				var gindex = expander.closest('div.datagrid-group').attr('group-index');
				var gpindex = expander.closest('div.datagrid-group').attr('gp-header');
				/* prosses collapse dan expand */
				if (gpindex == undefined) {
						if (expander.hasClass('datagrid-row-collapse')){
							$(target).datagrid('collapseGroup', gindex);
						} else {
							$(target).datagrid('expandGroup', gindex);
						}
				} else {
						if (expander.hasClass('datagrid-row-collapse')){
							$(target).datagrid('collapseGroupParent', expander);
						} else {
							$(target).datagrid('expandGroupParent', expander);
						}
				}
			} else {
				clickHandler(e);
			}
			e.stopPropagation();
		});
	},

	onBeforeRender: function(target, rows){
		var state = $.data(target, 'datagrid');
		var opts = state.options;

		initCss();

		var groupsParent = [];
		var groups = [];
		for(var i=0; i<rows.length; i++){
			var row = rows[i];
			if (Array.isArray(opts.groupField)) {
				var groupParent = getGroup(row[opts.groupField[0]]);
				var group = getGroup(row[opts.groupField[1]]);
			} else {
				var group = getGroup(row[opts.groupField]);
			}

			if (!group){
				if (Array.isArray(opts.groupField)) {
					group = {
						valueParent: row[opts.groupField[0]],
						value: row[opts.groupField[1]],
						rows: [row]
					};
					groupsParent.push(row[opts.groupField[0]]);
				} else {
					group = {
						value: row[opts.groupField],
						rows: [row]
					};
				}

				groups.push(group);
			} else {
				group.rows.push(row);
			}
		}

		var index = 0;
		var newRows = [];
		for(var i=0; i<groups.length; i++){
			var group = groups[i];
			group.startIndex = index;
			index += group.rows.length;
			newRows = newRows.concat(group.rows);
		}

		state.data.rows = newRows;

		groupsParent = groupsParent.filter(function(el, index, arr) {
        return index == arr.indexOf(el);
    });

		const groupBy = key => array =>
			array.reduce((objectsByKeyValue, obj) => {
				const value = obj[key];
				objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
				return objectsByKeyValue;
			}, {});

		var data_rows = [];
		for (var iG = 0; iG < groups.length; iG++) {
				for (var i = 0; i < groups[iG].rows.length; i++) {
					data_rows.push(groups[iG].rows[i]);
				}
		}

		if (data_rows > 0) {
				const groupByUnit = groupBy('unit_nama');
				data_rows = groupByUnit(data_rows);
		}

		groupsData = [];
		for (var i = 0; i < groupsParent.length; i++) {
				gp_rows = [];
				for (var iR = 0; iR < data_rows.length; iR++) {
						if (groupsParent[i] == data_rows[iR].unit_nama) {
								gp_rows.push(data_rows[iR]);
						}
				}

				group = {
					value: groupsParent[i],
					rows: [gp_rows]
				};
				groupsData.push(group);
		}

		this.groupsParent = groupsData;
		this.groups = groups;

		var that = this;
		setTimeout(function(){
			that.bindEvents(target);
		},0);

		function getGroup(value){
			for(var i=0; i<groups.length; i++){
				var group = groups[i];
				if (group.value == value){
					return group;
				}
			}
			return null;
		}
		function initCss(){
			if (!$('#datagrid-group-style').length){
				$('head').append(
					'<style id="datagrid-group-style">' +
					'.datagrid-group{height:'+opts.groupHeight+'px;overflow:hidden;font-weight:bold;border-bottom:1px solid #ccc;white-space:nowrap;word-break:normal;}' +
					'.datagrid-group-title,.datagrid-group-expander{display:inline-block;vertical-align:bottom;height:100%;line-height:'+opts.groupHeight+'px;padding:0 4px;}' +
					'.datagrid-group-title{position:relative;}' +
					'.datagrid-group-expander{width:'+opts.expanderWidth+'px;text-align:center;padding:0}' +
					'.datagrid-row-expander{margin:'+Math.floor((opts.groupHeight-16)/2)+'px 0;display:inline-block;width:16px;height:16px;cursor:pointer}' +
					'</style>'
				);
			}
		}
	},
	onAfterRender: function(target){
		$.fn.datagrid.defaults.view.onAfterRender.call(this, target);

		var view = this;
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		if (!state.onResizeColumn){
			state.onResizeColumn = opts.onResizeColumn;
		}
		if (!state.onResize){
			state.onResize = opts.onResize;
		}
		opts.onResizeColumn = function(field, width){
			view.resizeGroup(target);
			state.onResizeColumn.call(target, field, width);
		}
		opts.onResize = function(width, height){
			view.resizeGroup(target);
			state.onResize.call($(target).datagrid('getPanel')[0], width, height);
		}
		view.resizeGroup(target);
	}
});

$.extend($.fn.datagrid.methods, {
	groups:function(jq){
		return jq.datagrid('options').view.groups;
	},
    expandGroup:function(jq, groupIndex){
        return jq.each(function(){
        	var opts = $(this).datagrid('options');
            var view = $.data(this, 'datagrid').dc.view;
            var group = view.find(groupIndex!=undefined ? 'div.datagrid-group[group-index="'+groupIndex+'"]' : 'div.datagrid-group');
            var expander = group.find('span.datagrid-row-expander');
            if (expander.hasClass('datagrid-row-expand')){
                expander.removeClass('datagrid-row-expand').addClass('datagrid-row-collapse');
                group.next('table').show();
            }
            $(this).datagrid('fixRowHeight');
            if (opts.onExpandGroup){
            	opts.onExpandGroup.call(this, groupIndex);
            }
        });
    },
    collapseGroup:function(jq, groupIndex){
        return jq.each(function(){
        		var opts = $(this).datagrid('options');
            var view = $.data(this, 'datagrid').dc.view;
            var group = view.find(groupIndex!=undefined ? 'div.datagrid-group[group-index="'+groupIndex+'"]' : 'div.datagrid-group');
            var expander = group.find('span.datagrid-row-expander');

            if (expander.hasClass('datagrid-row-collapse')){
                expander.removeClass('datagrid-row-collapse').addClass('datagrid-row-expand');
                group.next('table').hide();
            }
            $(this).datagrid('fixRowHeight');
            if (opts.onCollapseGroup){
            	opts.onCollapseGroup.call(this, groupIndex);
            }
        });
    },

		expandGroupParent : function (jq, elem) {
			var thisme = this;
			var gpIndex = $(elem).attr('gp-span');
			return jq.each(function(){
					var opts = $(this).datagrid('options');
					var view = $.data(this, 'datagrid').dc.view;
					var group = view.find(gpIndex!=undefined ? 'div.datagrid-group[gp-header="'+gpIndex+'"]' : 'div.datagrid-group');
					var expander = group.find('span.datagrid-row-expander');

					if (expander.hasClass('datagrid-row-expand')){
							expander.removeClass('datagrid-row-expand').addClass('datagrid-row-collapse');
							groupChild = view.find('div.datagrid-group[gp-index="'+gpIndex+'"]');
							groupChild.hide()
							// for (var i = 0; i < groupChild.length; i++) {
							/* untuk collapse groupChild */
							// 		groupIndex = $(groupChild[i]).attr('group-index');
							// 		thisme.expandGroup(jq, groupIndex)
							// }
					}

					$(this).datagrid('fixRowHeight');
			});
		},

		collapseGroupParent : function (jq, elem) {
			var thisme = this;
			var gpIndex = $(elem).attr('gp-span');
			return jq.each(function(){
					var opts = $(this).datagrid('options');
					var view = $.data(this, 'datagrid').dc.view;
					var group = view.find(gpIndex!=undefined ? 'div.datagrid-group[gp-header="'+gpIndex+'"]' : 'div.datagrid-group');
					var expander = group.find('span.datagrid-row-expander');

					if (expander.hasClass('datagrid-row-collapse')){
							expander.removeClass('datagrid-row-collapse').addClass('datagrid-row-expand');
							groupChild = view.find('div.datagrid-group[gp-index="'+gpIndex+'"]');
							groupChild.hide()
							// for (var i = 0; i < groupChild.length; i++) {
							/* untuk collapse groupChild */
							// 		groupIndex = $(groupChild[i]).attr('group-index');
							// 		thisme.collapseGroup(jq, groupIndex)
							// }
					}
					$(this).datagrid('fixRowHeight');
			});
		},

    scrollToGroup: function(jq, groupIndex){
    	return jq.each(function(){
			var state = $.data(this, 'datagrid');
			var dc = state.dc;
			var grow = dc.body2.children('div.datagrid-group[group-index="'+groupIndex+'"]');
			if (grow.length){
				var groupHeight = grow.outerHeight();
				var headerHeight = dc.view2.children('div.datagrid-header')._outerHeight();
				var frozenHeight = dc.body2.outerHeight(true) - dc.body2.outerHeight();
				var top = grow.position().top - headerHeight - frozenHeight;
				if (top < 0){
					dc.body2.scrollTop(dc.body2.scrollTop() + top);
				} else if (top + groupHeight > dc.body2.height() - 18){
					dc.body2.scrollTop(dc.body2.scrollTop() + top + groupHeight - dc.body2.height() + 18);
				}
			}
    	});
    }
});

$.extend(groupview, {
	refreshGroupTitle: function(target, groupIndex, gpIndex){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		var group = this.groups[groupIndex];
		var span = dc.body1.add(dc.body2).children('div.datagrid-group[gp-index= ' + gpIndex + ' group-index=' + groupIndex + ']').find('span.datagrid-group-title');
		span.html(opts.groupFormatter.call(target, group.value, group.rows));
	},
	resizeGroup: function(target, groupIndex){
		var state = $.data(target, 'datagrid');
		var dc = state.dc;
		var ht = dc.header2.find('table');
		var fr = ht.find('tr.datagrid-filter-row').hide();
		// var ww = ht.width();
		var ww = dc.body2.children('table.datagrid-btable:first').width();
		if (groupIndex == undefined){
			var groupHeader = dc.body2.children('div.datagrid-group');
		} else {
			var groupHeader = dc.body2.children('div.datagrid-group[group-index=' + groupIndex + ']');
		}
		groupHeader._outerWidth(ww);
		var opts = state.options;
		if (opts.frozenColumns && opts.frozenColumns.length){
			var width = dc.view1.width() - opts.expanderWidth;
			var isRtl = dc.view1.css('direction').toLowerCase()=='rtl';
			groupHeader.find('.datagrid-group-title').css(isRtl?'right':'left', -width+'px');
		}
		if (fr.length){
			if (opts.showFilterBar){
				fr.show();
			}
		}
		// fr.show();
	},

	insertRow: function(target, index, row){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		var group = null;
		var groupIndex;

		if (!state.data.rows.length){
			$(target).datagrid('loadData', [row]);
			return;
		}

		for(var i=0; i<this.groups.length; i++){

			if (Array.isArray(opts.groupField)) {
				/*khusus apabila groupField array/multi*/
				if (this.groups[i].value == row[opts.groupField[0]]){
					group = this.groups[i];
					groupIndex = i;
					break;
				}
			}	else {
				if (this.groups[i].value == row[opts.groupField]){
					group = this.groups[i];
					groupIndex = i;
					break;
				}
			}
		}
		if (group){
			if (index == undefined || index == null){
				index = state.data.rows.length;
			}
			if (index < group.startIndex){
				index = group.startIndex;
			} else if (index > group.startIndex + group.rows.length){
				index = group.startIndex + group.rows.length;
			}
			$.fn.datagrid.defaults.view.insertRow.call(this, target, index, row);

			if (index >= group.startIndex + group.rows.length){
				_moveTr(index, true);
				_moveTr(index, false);
			}
			group.rows.splice(index - group.startIndex, 0, row);
		} else {
			group = {
				valueParent : row[opts.groupField[0]],
				value: row[opts.groupField[1]],
				rows: [row],
				startIndex: state.data.rows.length
			}
			groupIndex = this.groups.length;
			dc.body1.append(this.renderGroup.call(this, target, groupIndex, group, true));
			dc.body2.append(this.renderGroup.call(this, target, groupIndex, group, false));
			this.groups.push(group);
			state.data.rows.push(row);
		}

		this.setGroupIndex(target);
		this.refreshGroupTitle(target, groupIndex, 0);
		this.resizeGroup(target);

		function _moveTr(index,frozen){
			var serno = frozen?1:2;
			var prevTr = opts.finder.getTr(target, index-1, 'body', serno);
			var tr = opts.finder.getTr(target, index, 'body', serno);
			tr.insertAfter(prevTr);
		}
	},

	updateRow: function(target, index, row){
		var opts = $.data(target, 'datagrid').options;
		$.fn.datagrid.defaults.view.updateRow.call(this, target, index, row);
		var tb = opts.finder.getTr(target, index, 'body', 2).closest('table.datagrid-btable');
		var groupIndex = parseInt(tb.prev().attr('group-index'));
		var gpIndex = parseInt(tb.prev().attr('gp-index'));
		this.refreshGroupTitle(target, groupIndex, gpIndex);
	},

	deleteRow: function(target, index){
		var state = $.data(target, 'datagrid');
		var opts = state.options;
		var dc = state.dc;
		var body = dc.body1.add(dc.body2);

		var tb = opts.finder.getTr(target, index, 'body', 2).closest('table.datagrid-btable');
		var groupIndex = parseInt(tb.prev().attr('group-index'));
		var gpIndex = parseInt(tb.prev().attr('gp-index'));

		$.fn.datagrid.defaults.view.deleteRow.call(this, target, index);

		var group = this.groups[groupIndex];
		if (group.rows.length > 1){
			group.rows.splice(index-group.startIndex, 1);
			this.refreshGroupTitle(target, groupIndex, gpIndex);
		} else {
			body.children('div.datagrid-group[group-index='+groupIndex+']').remove();
			for(var i=groupIndex+1; i<this.groups.length; i++){
				body.children('div.datagrid-group[group-index='+i+']').attr('group-index', i-1);
			}
			this.groups.splice(groupIndex, 1);
		}

		this.setGroupIndex(target);
	},

	setGroupIndex: function(target){
		var index = 0;
		for(var i=0; i<this.groups.length; i++){
			var group = this.groups[i];
			group.startIndex = index;
			index += group.rows.length;
		}
	}
});
