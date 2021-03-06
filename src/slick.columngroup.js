(function ($) {
    $.extend(true, window, {
        "Slick": {
            "ColumnGroup": ColumnGroup
        }
    });

    var defaultOptions = {
        groupsAreFirst: true
    };

    function ColumnGroup() {
        var grid, $container, $groupHeaderColumns, self = this,
            isColumnGroupEnabled = false;
        var handler = new Slick.EventHandler();
        var options;

        function init(_grid) {
            grid = _grid;
            options = grid.getOptions();
            options = $.extend(defaultOptions, options);
            $container = $(grid.getContainerNode());
            handler.subscribe(grid.onColumnsResized, onColumnsResized);
            handler.subscribe(grid.onColumnsReordered, onColumnsReordered);
        }

        function enableColumnGrouping() {
            if (isColumnGroupEnabled) {
                return;
            }
            isColumnGroupEnabled = true;
            setGroupedColumns();
        }

        function removeColumnGrouping() {
            if (!isColumnGroupEnabled) {
                return;
            }
            isColumnGroupEnabled = false;
            $groupHeaderColumns.remove();
            grid.resizeCanvas();
        }

        function setGroupedColumns() {
            var headerColumns = $container.find(".slick-header-columns");
            $groupHeaderColumns = $('<div class="slick-group-header-columns ui-state-default"> </div>');
            $groupHeaderColumns.css({
                width: headerColumns.width() + "px",
                left: headerColumns.position().left + "px"
            });

            var columns = grid.getColumns();
            var columnGroups = getGroupedColumns(columns);
            //setGroupIndex(columns);
            setColumnIndex(columns);

            $groupHeaderColumns.append(getGroupedColumnsTemplate(columnGroups));
            $container.find(".slick-header").prepend($groupHeaderColumns);

            setupGroupColumnReorder();
            //columns.sort(groupCompare);
            grid.setColumns(columns);
            grid.resizeCanvas();
        }

        function getGroupedColumnsTemplate(columnGroups) {
            var slickColumns = "";
            $.each(columnGroups, function (name, group) {

                var width = group.columns.reduce(function (width, column) {
                    return width + column.width;
                }, 0);
                var displayName = name;
                var isEmpty = false;
                if (!group.isGroup) {
                    displayName = " ";
                    isEmpty = true;
                }

                slickColumns += '<div class="ui-state-default slick-header-column' + (isEmpty ? ' slick-header-column-empty' : '') + '" data-group-name="' + name + '"style="width:' + (width) + 'px"> <div class="slick-column-name">' + displayName + '</div></div>';
            });
            return slickColumns;
        }

        function setColumnIndex(columns) {
            columns.forEach(function (column, index) {
                column._index = index;
            });
        }

        // function setGroupIndex(columns) {
        //     var groupNames = Object.keys(getGroupedColumns(columns));
        //     columns.forEach(function (column) {
        //         column._groupIndex = groupNames.indexOf(column.groupName);
        //         if (options.groupsAreFirst) {
        //             column._groupIndex = column._groupIndex === -1 ? groupNames.length : column._groupIndex;
        //         }
        //         else {
        //             column._groupIndex = column._groupIndex === -1 ? -1 : column._groupIndex;
        //         }
        //     });
        // }

        function setupGroupColumnReorder() {
            if (options.enableColumnReorder) {
                $groupHeaderColumns.sortable({
                    containment: "parent",
                    distance: 3,
                    axis: "x",
                    cursor: "default",
                    tolerance: "intersection",
                    helper: "clone",
                    update: onColumnsReordered
                });
            }
        }

        function resizeCanvas() {
            var columns = grid.getColumns();

            if (!isColumnGroupEnabled) {
                self.onColumnsResized.notify(columns);
                return;
            }

            $.each(getGroupedColumns(columns), function (name, group) {
                var width = group.columns.reduce(function (width, column) {
                    return width + column.width;
                }, 0);

                $groupHeaderColumns.find("[data-group-name='" + name + "']").css("width", width);
            });

            var headerColumns = $container.find(".slick-header-columns");
            $groupHeaderColumns.css("width", headerColumns.width() + "px");
        }

        function onColumnsResized() {
            resizeCanvas();

            self.onColumnsResized.notify(columns);
        }


        function onColumnsReordered() {
            var columns = grid.getColumns();
            setColumnIndex(columns);

            if (!isColumnGroupEnabled) {
                self.onColumnsReordered.notify(columns);
                return;
            }

            // var $columns = $(".slick-group-header-columns .slick-header-column");
            // var columnGroups = getGroupedColumns(columns);
            // $columns.each(function (index, column) {
            //     var groupedColumns = columnGroups[$(column).data("group-name")];
            //     groupedColumns.columns.forEach(function (groupedColumn) {
            //         groupedColumn._groupIndex = index;
            //     });
            // });
            //columns.sort(groupCompare);
            grid.setColumns(columns);
            setColumnIndex(columns);
            self.onColumnsReordered.notify(columns);
        }

        // function groupCompare(c1, c2) {
        //     return (c1._groupIndex - c2._groupIndex) || (c1._index - c2._index);
        // }

        function getGroupedColumns(columns) {
            var groupedColumns = {};
            columns.forEach(function (column) {
                var groupName = column.groupName || column.field;
                groupedColumns[groupName] = groupedColumns[groupName] || { columns: [], isGroup: column.groupName ? true : false };
                groupedColumns[groupName].columns.push(column);
            });
            return groupedColumns;
        }

        function destroy() {
            handler.unsubscribeAll();
        }

        this.onColumnsReordered = new Slick.Event();
        this.onColumnsResized = new Slick.Event();

        return {
            init: init,
            destroy: destroy,
            onColumnsReordered: this.onColumnsReordered,
            onColumnsResized: this.onColumnsResized,
            enableColumnGrouping: enableColumnGrouping,
            removeColumnGrouping: removeColumnGrouping,
            resizeCanvas: resizeCanvas
        };
    }

} (jQuery));