define(function(require) {
    "use strict";

    function getReadWidget() {
        return '<ma-number-column field="::field" value="::entry.values[field.name()]"></ma-float-column>';
    }
    function getLinkWidget() {
        return '<a ng-click="gotoDetail()">' + getReadWidget() + '</a>';
    }
    function getFilterWidget() {
        return '<ma-input-field type="number" step="any" field="::field" value="values[field.name()]"></ma-input-field>';
    }
    function getWriteWidget() {
        return '<ma-input-field type="number" step="any" field="::field" value="entry.values[field.name()]"></ma-input-field>';
    }
    return {
        getReadWidget:   getReadWidget,
        getLinkWidget:   getLinkWidget,
        getFilterWidget: getFilterWidget,
        getWriteWidget:  getWriteWidget
    }
});