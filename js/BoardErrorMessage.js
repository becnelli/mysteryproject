(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('MyApp.BoardErrorMessage', {
        extend:'Ext.Container',
        alias:'widget.boarderrormessage',
        config: {
            businessValueProperty: ''
        },
        initComponent: function(){
            this.callParent(arguments);
            this.renderData = {property: this.getBusinessValueProperty()}
        },
        renderTpl: '<h1>Your subscription looks like it\'s missing {property}</h1>'
    });
})();

