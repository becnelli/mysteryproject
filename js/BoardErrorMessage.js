(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('MyApp.BoardErrorMessage', {
        extend:'Ext.Component',
        alias:'widget.boarderrormessage',
        config: {
            businessValueProperty: ''
        },
        initComponent: function(){
            this.callParent(arguments);
            this.renderData = {property: this.getBusinessValueProperty()};
        },
        renderTpl: '<p style="font-size:1.2em">Your subscription looks like it\'s missing {property}. Contact' +
            ' your subscription admin to add {property} to User Story.</p>'
    });
})();

