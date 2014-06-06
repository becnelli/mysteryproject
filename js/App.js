Ext.define('MyApp.App', {
    requires: ['MyApp.Toggle'],
    extend: 'Rally.app.App',
    componentCls: 'app',
    padding: '20 20 20 20',
    items: [
    ],
    padding: '20 20 20 20',
    
    launch: function() {
        this._addToggle();
        this._addBoard('PlanEstimate');
    },
    
    _addToggle: function(){
        this.add({
            xtype: 'customtoggle'
        });
    },
    
    _addBoard: function(attribute) {
        var columns = [
            {
                value: null,
                columnHeaderConfig: {
                    headerData: {value: 'Unestimated'}
                }
            }
        ];
        
        var estimateValues = [0, 1, 2, 3, 5, 8, 13, 20];

        _.each(estimateValues, function(estimate) {
            columns.push({
                value: estimate,
                columnHeaderConfig: {
                    headerData: {value: estimate}
                }
            });
        });
        
        this.board = this.add({
            xtype: 'rallycardboard',
            types: ['User Story'],
            attribute: attribute,
            context: this.getContext(),
            columnConfig: {
                columnHeaderConfig: {
                    headerTpl: '{value}'
                }
            },
            storeConfig: {
                filters: [
                    {
                        property: 'Iteration',
                        operation: '=',
                        value: ''
                    },
                    {
                        property: 'DirectChildrenCount',
                        operation: '=',
                        value: '0'
                    }
                ]
            },
          
            columns: columns
        });
    }
    
});
